import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import DataTable from '../components/DataTable';
import { STORES } from '../utils/sampleData';
import { formatDate, getMedicineById, getStoreName } from '../utils/inventoryUtils';

export default function TransferHistory({ medicines, transfers }) {
  const [query, setQuery] = useState('');
  const [storeId, setStoreId] = useState('');
  const [status, setStatus] = useState('');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...transfers]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.reference).localeCompare(String(a.reference)))
      .filter((transfer) => {
        const medicine = getMedicineById(medicines, transfer.medicineId);
        const haystack = [
          transfer.reference,
          transfer.batchNumber,
          medicine?.name,
          medicine?.medicineCode,
        ]
          .join(' ')
          .toLowerCase();
        const matchesQuery = !needle || haystack.includes(needle);
        const matchesStore =
          !storeId || transfer.sourceStoreId === storeId || transfer.destinationStoreId === storeId;
        const matchesStatus = !status || transfer.status === status;
        return matchesQuery && matchesStore && matchesStatus;
      });
  }, [transfers, medicines, query, storeId, status]);

  const columns = [
    { key: 'reference', label: 'Transfer reference' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'medicine',
      label: 'Medicine',
      render: (row) => getMedicineById(medicines, row.medicineId)?.name ?? 'Unknown',
    },
    { key: 'batchNumber', label: 'Batch number' },
    {
      key: 'source',
      label: 'Source store',
      render: (row) => getStoreName(row.sourceStoreId),
    },
    {
      key: 'destination',
      label: 'Destination store',
      render: (row) => getStoreName(row.destinationStoreId),
    },
    { key: 'quantity', label: 'Quantity' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
          {row.status}
        </span>
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
              placeholder="Search reference, medicine, or batch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="select-field" value={storeId} onChange={(event) => setStoreId(event.target.value)}>
            <option value="">All stores</option>
            {STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <select className="select-field" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage="No transfer history matches the current filters."
        />
      </div>
    </section>
  );
}
