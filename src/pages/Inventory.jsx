import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import MedicineForm from '../components/MedicineForm';
import { CATEGORIES, STORES } from '../utils/sampleData';
import { buildInventoryRows, currency, formatDate } from '../utils/inventoryUtils';

const EMPTY_FORM = {
  name: '',
  genericName: '',
  category: '',
  storeId: '',
  batchNumber: '',
  expiryDate: '',
  unitPrice: '',
  quantity: '',
  minStockThreshold: '',
};

export default function Inventory({ medicines, stockLots, onAdd, onUpdate, onDelete }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [storeId, setStoreId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLotId, setEditingLotId] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);

  const rows = useMemo(() => {
    const all = buildInventoryRows(medicines, stockLots);
    const needle = query.trim().toLowerCase();
    return all.filter((row) => {
      const matchesQuery =
        !needle ||
        row.name.toLowerCase().includes(needle) ||
        row.medicineCode.toLowerCase().includes(needle) ||
        row.genericName.toLowerCase().includes(needle);
      const matchesCategory = !category || row.category === category;
      const matchesStore = !storeId || row.storeId === storeId;
      return matchesQuery && matchesCategory && matchesStore;
    });
  }, [medicines, stockLots, query, category, storeId]);

  const openCreate = () => {
    setEditingLotId(null);
    setFormValues(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditingLotId(row.id);
    setFormValues({
      name: row.name,
      genericName: row.genericName,
      category: row.category,
      storeId: row.storeId,
      batchNumber: row.batchNumber,
      expiryDate: row.expiryDate,
      unitPrice: String(row.unitPrice),
      quantity: String(row.quantity),
      minStockThreshold: String(row.minStockThreshold),
    });
    setErrors({});
    setFormOpen(true);
  };

  const submitForm = () => {
    const result = editingLotId ? onUpdate(editingLotId, formValues) : onAdd(formValues);
    if (!result.ok) {
      setErrors(result.errors || { form: result.message });
      return;
    }
    setFormOpen(false);
  };

  const columns = [
    { key: 'medicineCode', label: 'Medicine ID' },
    { key: 'name', label: 'Medicine' },
    { key: 'genericName', label: 'Generic name' },
    { key: 'category', label: 'Category' },
    { key: 'batchNumber', label: 'Batch' },
    {
      key: 'expiryDate',
      label: 'Expiry',
      render: (row) => (
        <span>
          {formatDate(row.expiryDate)}{' '}
          {row.expiryStatus !== 'ok' ? (
            <span className={`badge ${row.expiryStatus === 'expired' ? 'badge-expired' : 'badge-soon'}`}>
              {row.expiryStatus === 'expired' ? 'Expired' : 'Soon'}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      label: 'Unit price',
      render: (row) => currency(row.unitPrice),
    },
    { key: 'quantity', label: 'Stock' },
    { key: 'minStockThreshold', label: 'Min stock' },
    { key: 'storeName', label: 'Store' },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        row.isLowStock ? <span className="badge badge-low">Low stock</span> : <span className="badge badge-ok">In stock</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <button className="icon-btn" onClick={() => openEdit(row)} aria-label="Edit medicine">
            <Pencil size={16} />
          </button>
          <button className="icon-btn" onClick={() => setPendingDelete(row)} aria-label="Delete medicine">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="panel">
        <div className="toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              placeholder="Search by name or ID"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="select-field" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="select-field" value={storeId} onChange={(event) => setStoreId(event.target.value)}>
            <option value="">All stores</option>
            {STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add medicine
          </button>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage="No medicines match the current search or filters."
          rowClassName={(row) => {
            if (row.expiryStatus === 'expired') return 'row-expired';
            if (row.expiryStatus === 'soon') return 'row-soon';
            if (row.isLowStock) return 'low-stock';
            return '';
          }}
        />
      </div>

      <MedicineForm
        open={formOpen}
        title={editingLotId ? 'Edit medicine' : 'Add medicine'}
        values={formValues}
        errors={errors}
        onChange={setFormValues}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete inventory record"
        message={
          pendingDelete
            ? `Delete ${pendingDelete.name} batch ${pendingDelete.batchNumber} from ${pendingDelete.storeName}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </section>
  );
}
