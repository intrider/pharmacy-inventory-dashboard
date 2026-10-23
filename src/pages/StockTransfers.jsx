import { useMemo, useState } from 'react';
import TransferForm from '../components/TransferForm';
import DataTable from '../components/DataTable';
import { formatDate, getMedicineById, getStoreName, todayISO } from '../utils/inventoryUtils';
import { generateTransferReference } from '../utils/transferUtils';

export default function StockTransfers({ medicines, stockLots, transfers, onCreate, onComplete }) {
  const [form, setForm] = useState(() => emptyForm(transfers));
  const [errors, setErrors] = useState({});

  const pending = useMemo(
    () => transfers.filter((transfer) => transfer.status === 'Pending'),
    [transfers]
  );

  const submit = () => {
    const result = onCreate(form);
    if (!result.ok) {
      setErrors(result.errors || {});
      return;
    }
    setErrors({});
    setForm(emptyForm([result.transfer, ...transfers]));
  };

  const columns = [
    { key: 'reference', label: 'Reference' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'medicine',
      label: 'Medicine',
      render: (row) => getMedicineById(medicines, row.medicineId)?.name ?? 'Unknown',
    },
    { key: 'batchNumber', label: 'Batch' },
    {
      key: 'route',
      label: 'Route',
      render: (row) => `${getStoreName(row.sourceStoreId)} → ${getStoreName(row.destinationStoreId)}`,
    },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'status',
      label: 'Status',
      render: () => <span className="badge badge-pending">Pending</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button className="btn btn-navy" onClick={() => onComplete(row.id)}>
          Complete transfer
        </button>
      ),
    },
  ];

  return (
    <section className="page">
      <TransferForm
        medicines={medicines}
        stockLots={stockLots}
        values={form}
        errors={errors}
        onChange={setForm}
        onSubmit={submit}
      />
      <article className="panel" style={{ marginTop: 16 }}>
        <h3>Pending transfers</h3>
        <p className="muted">Pending transfers do not change stock. Completing a transfer updates both stores at once.</p>
        <DataTable
          columns={columns}
          rows={pending}
          emptyMessage="No pending transfers. Create one above to move stock between stores."
        />
      </article>
    </section>
  );
}

function emptyForm(transfers) {
  return {
    reference: generateTransferReference(transfers),
    date: todayISO(),
    sourceStoreId: '',
    destinationStoreId: '',
    medicineId: '',
    batchNumber: '',
    quantity: '',
    remarks: '',
  };
}
