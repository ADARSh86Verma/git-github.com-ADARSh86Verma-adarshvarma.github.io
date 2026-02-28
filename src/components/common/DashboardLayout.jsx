import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar mobile={sidebarOpen ? 'open' : 'closed'} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              className="btn btn--icon btn--secondary"
              style={{ display: 'none' }}
              onClick={() => setSidebarOpen(true)}
              id="menu-toggle"
            >
              <Menu size={18} />
            </button>
            <h2>{title}</h2>
          </div>
          <div className="topbar-right">
            <span className="topbar-time">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </header>

        <div className="page-content fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
