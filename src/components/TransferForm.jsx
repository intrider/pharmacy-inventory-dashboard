import { STORES } from '../utils/sampleData';
import { getLotQuantity, getMedicineById, isExpired, todayISO } from '../utils/inventoryUtils';
import { getSourceLots } from '../utils/transferUtils';

export default function TransferForm({
  medicines,
  stockLots,
  values,
  errors,
  onChange,
  onSubmit,
}) {
  const sourceLots = getSourceLots(stockLots, values.sourceStoreId);
  const medicineOptions = uniqueMedicines(sourceLots, medicines);
  const batchOptions = sourceLots.filter((lot) => lot.medicineId === values.medicineId);
  const selectedLot = batchOptions.find((lot) => lot.batchNumber === values.batchNumber);
  const available = selectedLot
    ? getLotQuantity(stockLots, values.medicineId, values.sourceStoreId, values.batchNumber)
    : 0;
  const expired = selectedLot ? isExpired(selectedLot.expiryDate) : false;

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    if (name === 'sourceStoreId') {
      next.medicineId = '';
      next.batchNumber = '';
    }
    if (name === 'medicineId') {
      next.batchNumber = '';
    }
    onChange(next);
  };

  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h3>Create stock transfer</h3>
      <div className="form-grid">
        <Field label="Transfer reference">
          <input className="input" value={values.reference} readOnly />
        </Field>
        <Field label="Transfer date" error={errors.date}>
          <input
            className="input"
            type="date"
            name="date"
            max={todayISO()}
            value={values.date}
            onChange={handleChange}
          />
        </Field>
        <Field label="Source store" error={errors.sourceStoreId}>
          <select name="sourceStoreId" value={values.sourceStoreId} onChange={handleChange}>
            <option value="">Select source</option>
            {STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Destination store" error={errors.destinationStoreId}>
          <select name="destinationStoreId" value={values.destinationStoreId} onChange={handleChange}>
            <option value="">Select destination</option>
            {STORES.map((store) => (
              <option key={store.id} value={store.id} disabled={store.id === values.sourceStoreId}>
                {store.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Medicine" error={errors.medicineId}>
          <select name="medicineId" value={values.medicineId} onChange={handleChange}>
            <option value="">Select medicine</option>
            {medicineOptions.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.medicineCode} · {medicine.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Batch" error={errors.batchNumber}>
          <select name="batchNumber" value={values.batchNumber} onChange={handleChange}>
            <option value="">Select batch</option>
            {batchOptions.map((lot) => (
              <option key={lot.id} value={lot.batchNumber}>
                {lot.batchNumber} · exp {lot.expiryDate}
                {isExpired(lot.expiryDate) ? ' (expired)' : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Available quantity">
          <input className="input" value={expired ? `${available} (expired)` : available} readOnly />
        </Field>
        <Field label="Transfer quantity" error={errors.quantity}>
          <input
            className="input"
            type="number"
            min="1"
            step="1"
            name="quantity"
            value={values.quantity}
            onChange={handleChange}
          />
        </Field>
        <label className="field full">
          Remarks (optional)
          <textarea
            className="textarea"
            name="remarks"
            rows="3"
            value={values.remarks}
            onChange={handleChange}
          />
        </label>
        <Field label="Status">
          <input className="input" value="Pending" readOnly />
        </Field>
      </div>
      <div className="modal-foot" style={{ border: 0, padding: '16px 0 0' }}>
        <button type="submit" className="btn btn-primary">
          Create pending transfer
        </button>
      </div>
    </form>
  );
}

function uniqueMedicines(lots, medicines) {
  const ids = [...new Set(lots.map((lot) => lot.medicineId))];
  return ids
    .map((id) => getMedicineById(medicines, id))
    .filter(Boolean);
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      {label}
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
