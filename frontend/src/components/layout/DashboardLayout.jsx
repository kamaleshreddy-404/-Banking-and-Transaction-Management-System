import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DemoBanner from '../common/DemoBanner';
import { useNotifications } from '../../context/NotificationContext';
import { Megaphone, X } from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { announcements } = useNotifications();
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState([]);

  const activeAnnouncements = announcements.filter(
    a => !dismissedAnnouncements.includes(a.announcementId)
  );

  return (
    <div className="app-shell">
      <DemoBanner />
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {activeAnnouncements.length > 0 && (
        <div className="announcement-banner">
          <Megaphone size={16} className="announcement-icon" />
          <div className="announcement-text">
            <strong>{activeAnnouncements[0].title}:</strong> {activeAnnouncements[0].message}
          </div>
          <button 
            type="button" 
            className="btn-icon-xs"
            onClick={() => setDismissedAnnouncements(prev => [...prev, activeAnnouncements[0].announcementId])}
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content" id="main-content">
          <Outlet />
        </main>
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <span>&copy; {new Date().getFullYear()} FinCore Banking System — Simulated Educational Architecture.</span>
          <div className="footer-links">
            <span>MySQL 8.4 • Spring Boot 3.3.4 • React 18 • Double-Entry Immutable Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
