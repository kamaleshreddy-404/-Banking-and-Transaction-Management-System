import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Shield, ChevronDown, CheckCheck, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/dateFormatter';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button 
          type="button" 
          className="mobile-menu-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          <img src="/logo.svg" alt="FinCore Shield Logo" className="navbar-logo" />
          <span className="brand-text">FinCore</span>
        </Link>
        <span className="brand-sim-tag">VIRTUAL</span>
      </div>

      <div className="navbar-right">
        {/* Notification Bell Dropdown */}
        <div className="dropdown-container" ref={notifRef}>
          <button 
            type="button" 
            className="navbar-icon-btn" 
            onClick={() => setShowNotifications(prev => !prev)}
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-counter">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notification-menu">
              <div className="dropdown-header">
                <span className="dropdown-title">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button 
                    type="button" 
                    className="link-btn-xs"
                    onClick={() => markAllAsRead()}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="dropdown-empty">No notifications yet</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div 
                      key={n.notificationId} 
                      className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => markAsRead(n.notificationId)}
                    >
                      <div className="notification-item-header">
                        <strong className="notification-subject">{n.title}</strong>
                        <span className="notification-time">{formatRelativeTime(n.createdAt)}</span>
                      </div>
                      <p className="notification-msg">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="dropdown-footer">
                <Link to="/notifications" onClick={() => setShowNotifications(false)}>
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="dropdown-container" ref={userRef}>
          <button 
            type="button" 
            className="user-profile-btn" 
            onClick={() => setShowUserMenu(prev => !prev)}
          >
            <div className="avatar-placeholder">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details-summary">
              <span className="user-display-name">{user?.fullName || 'Demo User'}</span>
              <span className="user-role-label">{isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER'}</span>
            </div>
            <ChevronDown size={14} className="dropdown-caret" />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu user-dropdown-menu">
              <div className="dropdown-header user-header">
                <strong>{user?.fullName}</strong>
                <span className="user-email-text">{user?.email}</span>
                <span className="badge badge-primary user-badge">{user?.role}</span>
              </div>
              <div className="dropdown-divider" />
              <Link 
                to="/profile" 
                className="dropdown-link"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={16} /> My Profile
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="dropdown-link"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Shield size={16} /> Admin Portal
                </Link>
              )}
              <div className="dropdown-divider" />
              <button 
                type="button" 
                className="dropdown-link logout-link"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
