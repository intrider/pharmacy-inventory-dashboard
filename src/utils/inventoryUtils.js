import { STORES } from './sampleData';

export function getStore(storeId) {
  return STORES.find((store) => store.id === storeId) ?? null;
}

export function getStoreName(storeId) {
  return getStore(storeId)?.name ?? 'Unknown store';
}

export function getMedicineById(medicines, medicineId) {
  return medicines.find((medicine) => medicine.id === medicineId) ?? null;
}

export function todayISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function isExpired(expiryDate, referenceDate = new Date()) {
  const expiry = parseISODate(expiryDate);
  if (!expiry) return false;
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  return expiry < today;
}

export function isExpiringSoon(expiryDate, days = 90, referenceDate = new Date()) {
  const expiry = parseISODate(expiryDate);
  if (!expiry || isExpired(expiryDate, referenceDate)) return false;
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  return expiry <= limit;
}

export function getExpiryStatus(expiryDate, referenceDate = new Date()) {
  if (isExpired(expiryDate, referenceDate)) return 'expired';
  if (isExpiringSoon(expiryDate, 90, referenceDate)) return 'soon';
  return 'ok';
}

export function getLotQuantity(stockLots, medicineId, storeId, batchNumber) {
  const lot = stockLots.find(
    (item) =>
      item.medicineId === medicineId &&
      item.storeId === storeId &&
      item.batchNumber === batchNumber
  );
  return lot?.quantity ?? 0;
}

export function getMedicineTotalStock(stockLots, medicineId) {
  return stockLots
    .filter((lot) => lot.medicineId === medicineId)
    .reduce((sum, lot) => sum + Number(lot.quantity || 0), 0);
}

export function isLowStockMedicine(medicine, stockLots) {
  if (!medicine) return false;
  return getMedicineTotalStock(stockLots, medicine.id) < Number(medicine.minStockThreshold);
}

export function isLowStockLot(lot, medicine) {
  if (!lot || !medicine) return false;
  return Number(lot.quantity) < Number(medicine.minStockThreshold);
}

export function buildInventoryRows(medicines, stockLots) {
  return stockLots
    .map((lot) => {
      const medicine = getMedicineById(medicines, lot.medicineId);
      if (!medicine) return null;
      return {
        ...lot,
        medicineCode: medicine.medicineCode,
        name: medicine.name,
        genericName: medicine.genericName,
        category: medicine.category,
        unitPrice: medicine.unitPrice,
        minStockThreshold: medicine.minStockThreshold,
        storeName: getStoreName(lot.storeId),
        expiryStatus: getExpiryStatus(lot.expiryDate),
        isLowStock: isLowStockLot(lot, medicine),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name) || a.storeName.localeCompare(b.storeName));
}

export function getDashboardStats(medicines, stockLots, transfers) {
  const totalMedicines = medicines.length;
  const totalStockUnits = stockLots.reduce((sum, lot) => sum + Number(lot.quantity || 0), 0);
  const lowStockMedicines = medicines.filter((medicine) =>
    isLowStockMedicine(medicine, stockLots)
  );
  const pendingTransfers = transfers.filter((transfer) => transfer.status === 'Pending');
  const expiringLots = stockLots.filter((lot) => getExpiryStatus(lot.expiryDate) !== 'ok');

  return {
    totalMedicines,
    totalStockUnits,
    lowStockCount: lowStockMedicines.length,
    pendingTransferCount: pendingTransfers.length,
    lowStockMedicines,
    expiringLots,
    recentTransfers: [...transfers].sort((a, b) => {
      const aTime = a.completedAt || a.createdAt || a.date;
      const bTime = b.completedAt || b.createdAt || b.date;
      return String(bTime).localeCompare(String(aTime));
    }).slice(0, 6),
  };
}

export function nextMedicineCode(medicines) {
  const numbers = medicines
    .map((medicine) => Number(String(medicine.medicineCode).replace(/\D/g, '')))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 1000) + 1;
  return `MED-${next}`;
}

export function validateMedicineForm(form) {
  const errors = {};
  if (!String(form.name || '').trim()) errors.name = 'Medicine name is required.';
  if (!String(form.genericName || '').trim()) errors.genericName = 'Generic name is required.';
  if (!String(form.category || '').trim()) errors.category = 'Category is required.';
  if (!String(form.batchNumber || '').trim()) errors.batchNumber = 'Batch number is required.';
  if (!String(form.expiryDate || '').trim()) errors.expiryDate = 'Expiry date is required.';
  if (!String(form.storeId || '').trim()) errors.storeId = 'Store location is required.';

  const unitPrice = Number(form.unitPrice);
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    errors.unitPrice = 'Enter a valid unit price of 0 or more.';
  }

  const quantity = Number(form.quantity);
  if (!Number.isInteger(quantity) || quantity < 0) {
    errors.quantity = 'Stock quantity must be a whole number of 0 or more.';
  }

  const minStockThreshold = Number(form.minStockThreshold);
  if (!Number.isInteger(minStockThreshold) || minStockThreshold < 0) {
    errors.minStockThreshold = 'Minimum stock must be a whole number of 0 or more.';
  }

  return errors;
}

export function currency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  const date = parseISODate(value) ?? (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
