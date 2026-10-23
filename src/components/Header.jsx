import { Menu } from 'lucide-react';

const TITLES = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Live inventory, alerts, and transfer activity',
  },
  inventory: {
    title: 'Medicine Inventory',
    subtitle: 'Search, filter, and manage store-wise stock lots',
  },
  transfers: {
    title: 'Stock Transfers',
    subtitle: 'Move batches between Main, OP, and IP pharmacies',
  },
  history: {
    title: 'Transfer History',
    subtitle: 'Search completed and pending movement records',
  },
};

export default function Header({ currentPage, onMenu }) {
  const copy = TITLES[currentPage] ?? TITLES.dashboard;

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenu} aria-label="Open navigation">
        <Menu size={18} />
      </button>
      <div className="page-title">
        <h2>{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </div>
    </header>
  );
}
