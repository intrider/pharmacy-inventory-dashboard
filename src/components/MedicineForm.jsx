import { CATEGORIES, STORES } from '../utils/sampleData';

export default function MedicineForm({
  open,
  title,
  values,
  errors,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ ...values, [name]: value });
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          {errors.form ? <p className="field-error">{errors.form}</p> : null}
          <div className="form-grid">
            <Field label="Medicine name" error={errors.name}>
              <input className="input" name="name" value={values.name} onChange={handleChange} />
            </Field>
            <Field label="Generic name" error={errors.genericName}>
              <input
                className="input"
                name="genericName"
                value={values.genericName}
                onChange={handleChange}
              />
            </Field>
            <Field label="Category" error={errors.category}>
              <select name="category" value={values.category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Store location" error={errors.storeId}>
              <select name="storeId" value={values.storeId} onChange={handleChange}>
                <option value="">Select store</option>
                {STORES.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Batch number" error={errors.batchNumber}>
              <input
                className="input"
                name="batchNumber"
                value={values.batchNumber}
                onChange={handleChange}
              />
            </Field>
            <Field label="Expiry date" error={errors.expiryDate}>
              <input
                className="input"
                type="date"
                name="expiryDate"
                value={values.expiryDate}
                onChange={handleChange}
              />
            </Field>
            <Field label="Unit price (INR)" error={errors.unitPrice}>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                name="unitPrice"
                value={values.unitPrice}
                onChange={handleChange}
              />
            </Field>
            <Field label="Stock quantity" error={errors.quantity}>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                name="quantity"
                value={values.quantity}
                onChange={handleChange}
              />
            </Field>
            <Field label="Minimum stock threshold" error={errors.minStockThreshold}>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                name="minStockThreshold"
                value={values.minStockThreshold}
                onChange={handleChange}
              />
            </Field>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save medicine
          </button>
        </div>
      </form>
    </div>
  );
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
