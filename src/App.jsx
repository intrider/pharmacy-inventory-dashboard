import { useCallback, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import { usePharmacyStore } from './hooks/usePharmacyStore';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockTransfers from './pages/StockTransfers';
import TransferHistory from './pages/TransferHistory';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const store = usePharmacyStore();

  const notify = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  const addMedicine = (form) => {
    const result = store.addMedicineLot(form);
    if (result.ok) notify('success', 'Medicine added to inventory.');
    else notify('error', 'Please correct the highlighted fields.');
    return result;
  };

  const updateMedicine = (lotId, form) => {
    const result = store.updateMedicineLot(lotId, form);
    if (result.ok) notify('success', 'Medicine details updated.');
    else notify('error', 'Please correct the highlighted fields.');
    return result;
  };

  const deleteMedicine = (lotId) => {
    const result = store.deleteMedicineLot(lotId);
    if (result.ok) notify('success', 'Inventory record deleted.');
    else notify('error', result.message || 'Unable to delete this record.');
    return result;
  };

  const createTransfer = (form) => {
    const result = store.createTransfer(form);
    if (result.ok) notify('success', `${result.transfer.reference} created as pending.`);
    else notify('error', 'Transfer could not be created. Check the form.');
    return result;
  };

  const completeTransfer = (transferId) => {
    const result = store.completeTransfer(transferId);
    if (result.ok) notify('success', 'Transfer completed and stock updated.');
    else notify('error', result.message || 'Unable to complete this transfer.');
    return result;
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-area">
        <Header currentPage={page} onMenu={() => setSidebarOpen(true)} />
        {page === 'dashboard' ? (
          <Dashboard
            medicines={store.medicines}
            stockLots={store.stockLots}
            transfers={store.transfers}
            onNavigate={setPage}
          />
        ) : null}
        {page === 'inventory' ? (
          <Inventory
            medicines={store.medicines}
            stockLots={store.stockLots}
            onAdd={addMedicine}
            onUpdate={updateMedicine}
            onDelete={deleteMedicine}
          />
        ) : null}
        {page === 'transfers' ? (
          <StockTransfers
            medicines={store.medicines}
            stockLots={store.stockLots}
            transfers={store.transfers}
            onCreate={createTransfer}
            onComplete={completeTransfer}
          />
        ) : null}
        {page === 'history' ? (
          <TransferHistory medicines={store.medicines} transfers={store.transfers} />
        ) : null}
      </div>
      <Toast toasts={toasts} />
    </div>
  );
}
