import { Activity, ArrowLeftRight, History, LayoutDashboard, Package, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight },
  { id: 'history', label: 'Transfer History', icon: History },
];

export default function Sidebar({ currentPage, onNavigate, open, onClose }) {
  return (
    <>
      {open ? <div className="sidebar-backdrop" onClick={onClose} /> : null}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Plus size={22} />
          </div>
          <div>
            <h1>PharmaFlow</h1>
            <p>Inventory control</p>
          </div>
        </div>
        <nav className="nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <Activity size={14} /> Demo clinic network · 3 stores
        </div>
      </aside>
    </>
  );
}
