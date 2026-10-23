import { createId, getLotQuantity, getMedicineById, isExpired } from './inventoryUtils';

export function generateTransferReference(transfers) {
  const year = new Date().getFullYear();
  const numbers = transfers
    .map((transfer) => {
      const match = String(transfer.reference || '').match(/TRF-\d{4}-(\d+)/);
      return match ? Number(match[1]) : 0;
    })
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `TRF-${year}-${String(next).padStart(4, '0')}`;
}

export function getSourceLots(stockLots, sourceStoreId) {
  return stockLots.filter((lot) => lot.storeId === sourceStoreId && Number(lot.quantity) > 0);
}

export function findLot(stockLots, medicineId, storeId, batchNumber) {
  return (
    stockLots.find(
      (lot) =>
        lot.medicineId === medicineId &&
        lot.storeId === storeId &&
        lot.batchNumber === batchNumber
    ) ?? null
  );
}

export function validateTransfer(form, stockLots, medicines) {
  const errors = {};
  const sourceStoreId = form.sourceStoreId;
  const destinationStoreId = form.destinationStoreId;
  const medicineId = form.medicineId;
  const batchNumber = form.batchNumber;
  const quantity = Number(form.quantity);

  if (!sourceStoreId) errors.sourceStoreId = 'Select a source store.';
  if (!destinationStoreId) errors.destinationStoreId = 'Select a destination store.';
  if (sourceStoreId && destinationStoreId && sourceStoreId === destinationStoreId) {
    errors.destinationStoreId = 'Source and destination stores must be different.';
  }
  if (!medicineId) errors.medicineId = 'Select a medicine.';
  if (!batchNumber) errors.batchNumber = 'Select a batch.';
  if (!form.date) errors.date = 'Transfer date is required.';

  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.quantity = 'Transfer quantity must be a positive whole number.';
  }

  const sourceLot = findLot(stockLots, medicineId, sourceStoreId, batchNumber);
  if (medicineId && sourceStoreId && batchNumber && !sourceLot) {
    errors.batchNumber = 'This batch is not available at the source store.';
  }

  if (sourceLot && isExpired(sourceLot.expiryDate)) {
    errors.batchNumber = 'Expired medicine cannot be transferred.';
  }

  const available = getLotQuantity(stockLots, medicineId, sourceStoreId, batchNumber);
  if (!errors.quantity && quantity > available) {
    errors.quantity = `Quantity cannot exceed available stock (${available}).`;
  }

  if (sourceLot && !errors.quantity && available - quantity < 0) {
    errors.quantity = 'Transfer would result in negative inventory.';
  }

  const medicine = getMedicineById(medicines, medicineId);
  if (medicineId && !medicine) {
    errors.medicineId = 'Selected medicine was not found.';
  }

  return errors;
}

export function applyCompletedTransfer(stockLots, transfer) {
  const quantity = Number(transfer.quantity);
  const sourceLot = findLot(
    stockLots,
    transfer.medicineId,
    transfer.sourceStoreId,
    transfer.batchNumber
  );

  if (!sourceLot) {
    throw new Error('Source batch was not found.');
  }
  if (isExpired(sourceLot.expiryDate)) {
    throw new Error('Expired medicine cannot be transferred.');
  }
  if (quantity <= 0 || quantity > sourceLot.quantity) {
    throw new Error('Insufficient stock to complete this transfer.');
  }

  let destinationLot = findLot(
    stockLots,
    transfer.medicineId,
    transfer.destinationStoreId,
    transfer.batchNumber
  );

  const nextLots = stockLots.map((lot) => {
    if (lot.id === sourceLot.id) {
      return { ...lot, quantity: lot.quantity - quantity };
    }
    if (destinationLot && lot.id === destinationLot.id) {
      return { ...lot, quantity: lot.quantity + quantity };
    }
    return lot;
  });

  if (!destinationLot) {
    nextLots.push({
      id: createId('lot'),
      medicineId: transfer.medicineId,
      storeId: transfer.destinationStoreId,
      batchNumber: transfer.batchNumber,
      expiryDate: sourceLot.expiryDate,
      quantity,
    });
  }

  return nextLots;
}

export function canCompleteTransfer(transfer, stockLots) {
  if (!transfer || transfer.status === 'Completed') {
    return { ok: false, reason: 'This transfer has already been processed.' };
  }

  const sourceLot = findLot(
    stockLots,
    transfer.medicineId,
    transfer.sourceStoreId,
    transfer.batchNumber
  );

  if (!sourceLot) {
    return { ok: false, reason: 'Source batch is no longer available.' };
  }
  if (isExpired(sourceLot.expiryDate)) {
    return { ok: false, reason: 'Expired medicine cannot be transferred.' };
  }
  if (Number(transfer.quantity) > sourceLot.quantity) {
    return { ok: false, reason: 'Insufficient stock to complete this transfer.' };
  }
  return { ok: true, reason: '' };
}
