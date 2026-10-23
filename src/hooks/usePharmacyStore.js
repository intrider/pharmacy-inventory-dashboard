import { getInitialData, STORAGE_KEY } from '../utils/sampleData';
import {
  createId,
  nextMedicineCode,
  validateMedicineForm,
} from '../utils/inventoryUtils';
import {
  applyCompletedTransfer,
  canCompleteTransfer,
  generateTransferReference,
  validateTransfer,
} from '../utils/transferUtils';
import { useLocalStorage } from './useLocalStorage';

function isValidData(data) {
  return (
    data &&
    Array.isArray(data.medicines) &&
    Array.isArray(data.stockLots) &&
    Array.isArray(data.transfers)
  );
}

export function usePharmacyStore() {
  const [data, setData] = useLocalStorage(STORAGE_KEY, getInitialData());

  const medicines = isValidData(data) ? data.medicines : getInitialData().medicines;
  const stockLots = isValidData(data) ? data.stockLots : getInitialData().stockLots;
  const transfers = isValidData(data) ? data.transfers : getInitialData().transfers;

  const update = (patch) => {
    setData((current) => {
      const base = isValidData(current) ? current : getInitialData();
      return { ...base, ...patch };
    });
  };

  const addMedicineLot = (form) => {
    const errors = validateMedicineForm(form);
    if (Object.keys(errors).length) {
      return { ok: false, errors };
    }

    const medicineId = createId('med');
    const medicine = {
      id: medicineId,
      medicineCode: nextMedicineCode(medicines),
      name: form.name.trim(),
      genericName: form.genericName.trim(),
      category: form.category,
      unitPrice: Number(form.unitPrice),
      minStockThreshold: Number(form.minStockThreshold),
    };

    const lot = {
      id: createId('lot'),
      medicineId,
      storeId: form.storeId,
      batchNumber: form.batchNumber.trim().toUpperCase(),
      expiryDate: form.expiryDate,
      quantity: Number(form.quantity),
    };

    update({
      medicines: [...medicines, medicine],
      stockLots: [...stockLots, lot],
    });

    return { ok: true, medicine };
  };

  const updateMedicineLot = (lotId, form) => {
    const errors = validateMedicineForm(form);
    if (Object.keys(errors).length) {
      return { ok: false, errors };
    }

    const existingLot = stockLots.find((lot) => lot.id === lotId);
    if (!existingLot) {
      return { ok: false, errors: { form: 'Inventory record was not found.' } };
    }

    const nextMedicines = medicines.map((medicine) =>
      medicine.id === existingLot.medicineId
        ? {
            ...medicine,
            name: form.name.trim(),
            genericName: form.genericName.trim(),
            category: form.category,
            unitPrice: Number(form.unitPrice),
            minStockThreshold: Number(form.minStockThreshold),
          }
        : medicine
    );

    const nextLots = stockLots.map((lot) =>
      lot.id === lotId
        ? {
            ...lot,
            storeId: form.storeId,
            batchNumber: form.batchNumber.trim().toUpperCase(),
            expiryDate: form.expiryDate,
            quantity: Number(form.quantity),
          }
        : lot
    );

    update({ medicines: nextMedicines, stockLots: nextLots });
    return { ok: true };
  };

  const deleteMedicineLot = (lotId) => {
    const existingLot = stockLots.find((lot) => lot.id === lotId);
    if (!existingLot) {
      return { ok: false, message: 'Inventory record was not found.' };
    }

    const nextLots = stockLots.filter((lot) => lot.id !== lotId);
    const remainingForMedicine = nextLots.some(
      (lot) => lot.medicineId === existingLot.medicineId
    );
    const nextMedicines = remainingForMedicine
      ? medicines
      : medicines.filter((medicine) => medicine.id !== existingLot.medicineId);

    update({ medicines: nextMedicines, stockLots: nextLots });
    return { ok: true };
  };

  const createTransfer = (form) => {
    const errors = validateTransfer(form, stockLots, medicines);
    if (Object.keys(errors).length) {
      return { ok: false, errors };
    }

    const transfer = {
      id: createId('trf'),
      reference: generateTransferReference(transfers),
      date: form.date,
      sourceStoreId: form.sourceStoreId,
      destinationStoreId: form.destinationStoreId,
      medicineId: form.medicineId,
      batchNumber: form.batchNumber,
      quantity: Number(form.quantity),
      remarks: String(form.remarks || '').trim(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    update({ transfers: [transfer, ...transfers] });
    return { ok: true, transfer };
  };

  const completeTransfer = (transferId) => {
    const transfer = transfers.find((item) => item.id === transferId);
    if (!transfer) {
      return { ok: false, message: 'Transfer was not found.' };
    }

    const check = canCompleteTransfer(transfer, stockLots);
    if (!check.ok) {
      return { ok: false, message: check.reason };
    }

    try {
      const nextLots = applyCompletedTransfer(stockLots, transfer);
      const nextTransfers = transfers.map((item) =>
        item.id === transferId
          ? { ...item, status: 'Completed', completedAt: new Date().toISOString() }
          : item
      );
      update({ stockLots: nextLots, transfers: nextTransfers });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  return {
    medicines,
    stockLots,
    transfers,
    addMedicineLot,
    updateMedicineLot,
    deleteMedicineLot,
    createTransfer,
    completeTransfer,
  };
}
