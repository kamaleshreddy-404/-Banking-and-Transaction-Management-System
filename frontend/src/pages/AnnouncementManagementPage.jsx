import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  Megaphone, 
  PlusCircle, 
  Trash2, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

const AnnouncementManagementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      setError('Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert('Please fill in both title and message.');
      return;
    }

    try {
      setSubmitting(true);
      await adminService.createAnnouncement(newAnnouncement);
      setShowCreateModal(false);
      setNewAnnouncement({ title: '', message: '' });
      await loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this system announcement?')) return;
    try {
      await adminService.deleteAnnouncement(id);
      await loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  return (
    <div className="dashboard-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">System Announcements</h1>
          <p className="page-subheading">
            Broadcast simulated maintenance advisories and security updates to customer dashboards
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusCircle size={16} /> Broadcast New Announcement
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} height="100px" />
      ) : announcements.length === 0 ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '3.5rem 1rem' }}>
            <Megaphone size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
            <h3>No Active Announcements</h3>
            <p className="text-muted">Post a broadcast to display notices on the customer portal.</p>
          </div>
        </div>
      ) : (
        <div className="announcements-stack">
          {announcements.map(a => (
            <div key={a.announcementId} className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={18} className="text-primary" />
                  <strong style={{ fontSize: '1.05rem' }}>{a.title}</strong>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleDeleteAnnouncement(a.announcementId)}
                  title="Delete Announcement"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
              <div className="card-body">
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  {a.message}
                </p>
              </div>
              <div className="card-footer" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Published on {formatDateTime(a.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Broadcast System Announcement"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateAnnouncement}
              disabled={submitting}
            >
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateAnnouncement}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Headline / Title *</label>
            <input
              id="title"
              type="text"
              className="form-control"
              placeholder="e.g. Scheduled Virtual Core Maintenance Window"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">Announcement Message *</label>
            <textarea
              id="message"
              className="form-control"
              rows={4}
              placeholder="Provide notification details visible to all customers on their top banner..."
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementManagementPage;
