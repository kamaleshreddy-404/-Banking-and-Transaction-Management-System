import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  History,
  Users,
  LifeBuoy,
  Bell,
  User,
  Shield,
  ShieldAlert,
  Building2,
  Activity,
  BookOpen,
  FileText,
  Sliders,
  Headphones,
  Megaphone,
  HeartPulse,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="nav-section-title">CORE BANKING</div>
          <nav className="nav-links">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/accounts" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Wallet size={18} />
              <span>My Accounts</span>
            </NavLink>
            <NavLink 
              to="/transfer" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <ArrowRightLeft size={18} />
              <span>Fund Transfer</span>
            </NavLink>
            <NavLink 
              to="/transactions" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <History size={18} />
              <span>History</span>
            </NavLink>
            <NavLink 
              to="/beneficiaries" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>Beneficiaries</span>
            </NavLink>
            <NavLink 
              to="/notifications" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Bell size={18} />
              <span>Notifications</span>
              {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
            </NavLink>
            <NavLink 
              to="/support" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LifeBuoy size={18} />
              <span>Support Desk</span>
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <User size={18} />
              <span>Profile Settings</span>
            </NavLink>
          </nav>

          {isAdmin && (
            <>
              <div className="nav-section-title admin-title">ADMINISTRATION</div>
              <nav className="nav-links">
                <NavLink 
                  to="/admin" 
                  end
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <ShieldAlert size={18} />
                  <span>Admin Overview</span>
                </NavLink>
                <NavLink 
                  to="/admin/users" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Users size={18} />
                  <span>User Directory</span>
                </NavLink>
                <NavLink 
                  to="/admin/accounts" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Building2 size={18} />
                  <span>Account Control</span>
                </NavLink>
                <NavLink 
                  to="/admin/transactions" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Activity size={18} />
                  <span>Transactions</span>
                </NavLink>
                <NavLink 
                  to="/admin/ledger" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <BookOpen size={18} />
                  <span>Immutable Ledger</span>
                </NavLink>
                <NavLink 
                  to="/admin/audit-logs" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <FileText size={18} />
                  <span>Audit Trail</span>
                </NavLink>
                <NavLink 
                  to="/admin/limits" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Sliders size={18} />
                  <span>Transfer Limits</span>
                </NavLink>
                <NavLink 
                  to="/admin/tickets" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Headphones size={18} />
                  <span>Support Queue</span>
                </NavLink>
                <NavLink 
                  to="/admin/announcements" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Megaphone size={18} />
                  <span>Announcements</span>
                </NavLink>
                <NavLink 
                  to="/admin/health" 
                  className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <HeartPulse size={18} />
                  <span>System Health</span>
                </NavLink>
              </nav>
            </>
          )}

          <div className="sidebar-footer-info">
            <NavLink to="/demo-info" className="sidebar-info-link" onClick={onClose}>
              <Info size={14} /> Educational Architecture
            </NavLink>
            <div className="sidebar-version">FinCore v1.0.0 (MySQL + Spring Boot 3)</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
