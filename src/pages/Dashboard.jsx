import { AlertTriangle, ArrowLeftRight, Clock3, Package, Pill } from 'lucide-react';
import StatCard from '../components/StatCard';
import {
  currency,
  formatDate,
  getDashboardStats,
  getExpiryStatus,
  getMedicineById,
  getMedicineTotalStock,
  getStoreName,
} from '../utils/inventoryUtils';

export default function Dashboard({ medicines, stockLots, transfers, onNavigate }) {
  const stats = getDashboardStats(medicines, stockLots, transfers);

  return (
    <section className="page">
      <div className="grid-stats">
        <StatCard label="Total medicines" value={stats.totalMedicines} icon={Pill} />
        <StatCard
          label="Total stock units"
          value={stats.totalStockUnits.toLocaleString('en-IN')}
          icon={Package}
          tone="navy"
        />
        <StatCard
          label="Low-stock medicines"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Pending transfers"
          value={stats.pendingTransferCount}
          icon={Clock3}
          tone="danger"
        />
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <h3>Recent transfer activity</h3>
          {stats.recentTransfers.length ? (
            <div className="activity-list">
              {stats.recentTransfers.map((transfer) => {
                const medicine = getMedicineById(medicines, transfer.medicineId);
                return (
                  <div key={transfer.id} className="activity-item">
                    <div>
                      <strong>{transfer.reference}</strong>
                      <span className="muted">
                        {medicine?.name ?? 'Unknown'} · {transfer.quantity} units ·{' '}
                        {getStoreName(transfer.sourceStoreId)} → {getStoreName(transfer.destinationStoreId)}
                      </span>
                    </div>
                    <span className={`badge ${transfer.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                      {transfer.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No transfers recorded yet.</div>
          )}
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => onNavigate('history')}>
              <ArrowLeftRight size={16} /> View history
            </button>
          </div>
        </article>

        <article className="panel">
          <h3>Low-stock alerts</h3>
          {stats.lowStockMedicines.length ? (
            <div className="alert-list">
              {stats.lowStockMedicines.map((medicine) => {
                const total = getMedicineTotalStock(stockLots, medicine.id);
                return (
                  <div key={medicine.id} className="alert-item">
                    <div>
                      <strong>{medicine.name}</strong>
                      <span className="muted">
                        {total} units on hand · threshold {medicine.minStockThreshold} · {currency(medicine.unitPrice)}
                      </span>
                    </div>
                    <span className="badge badge-low">Low stock</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">All medicines are above threshold.</div>
          )}
        </article>
      </div>

      <article className="panel" style={{ marginTop: 16 }}>
        <h3>Expiry watchlist</h3>
        {stats.expiringLots.length ? (
          <div className="alert-list">
            {stats.expiringLots.map((lot) => {
              const medicine = getMedicineById(medicines, lot.medicineId);
              const status = getExpiryStatus(lot.expiryDate);
              return (
                <div key={lot.id} className="alert-item">
                  <div>
                    <strong>{medicine?.name ?? 'Unknown'}</strong>
                    <span className="muted">
                      {lot.batchNumber} · {getStoreName(lot.storeId)} · {lot.quantity} units · exp{' '}
                      {formatDate(lot.expiryDate)}
                    </span>
                  </div>
                  <span className={`badge ${status === 'expired' ? 'badge-expired' : 'badge-soon'}`}>
                    {status === 'expired' ? 'Expired' : 'Expiring soon'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No expired or soon-to-expire lots.</div>
        )}
      </article>
    </section>
  );
}
