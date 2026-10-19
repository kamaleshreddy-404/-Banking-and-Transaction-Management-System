import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import notificationService from '../services/notificationService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDateTime, formatRelativeTime } from '../utils/dateFormatter';
import { 
  Bell, 
  CheckCheck, 
  Check, 
  Megaphone, 
  Info, 
  ShieldAlert, 
  CreditCard 
} from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    notificationService.getAnnouncements().then(setAnnouncements).catch(() => {});
  }, []);

  return (
    <div className="dashboard-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Notifications & Alerts</h1>
          <p className="page-subheading">
            Stay informed about your virtual transaction activity, security notices, and system announcements
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={markAllAsRead}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {/* System Announcements */}
      {announcements.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: '#fed7aa', background: '#fffbeb' }}>
          <div className="card-header" style={{ borderBottom: '1px solid #fed7aa', color: '#b45309' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={18} />
              <strong style={{ fontSize: '1rem' }}>Active System Announcements</strong>
            </div>
          </div>
          <div className="card-body">
            {announcements.map(a => (
              <div key={a.announcementId} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #fef3c7' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#92400e', fontSize: '0.95rem' }}>{a.title}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f' }}>{a.message}</p>
                <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                  Posted on {formatDateTime(a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Notifications List */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} />
            <span style={{ fontWeight: 600 }}>Your Notifications</span>
          </div>
          <span className="badge badge-primary">{unreadCount} Unread</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {notifications.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem 1rem' }}>
              <Bell size={36} className="text-muted" style={{ marginBottom: '1rem' }} />
              <h4>No notifications right now</h4>
              <p style={{ fontSize: '0.875rem' }}>
                When you initiate transfers or your virtual balance updates, alerts will show here.
              </p>
            </div>
          ) : (
            <div className="notification-full-list">
              {notifications.map(n => (
                <div
                  key={n.notificationId}
                  className={`notification-row ${!n.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-icon-box">
                    <Info size={18} />
                  </div>
                  <div className="notification-body">
                    <div className="notification-row-header">
                      <strong className="notification-row-title">{n.title}</strong>
                      <span className="notification-time-tag">{formatRelativeTime(n.createdAt)}</span>
                    </div>
                    <p className="notification-row-text">{n.message}</p>
                    <div className="notification-meta-stamp">
                      {formatDateTime(n.createdAt)}
                    </div>
                  </div>
                  <div className="notification-action">
                    {!n.isRead ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => markAsRead(n.notificationId)}
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Read</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
