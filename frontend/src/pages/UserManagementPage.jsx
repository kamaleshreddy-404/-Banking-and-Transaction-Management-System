import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  CheckCircle, 
  Ban, 
  AlertCircle,
  Filter 
} from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Status Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, status]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getUsers({
        page,
        size: 10,
        query: query.trim() || undefined,
        status: status || undefined
      });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadUsers();
  };

  const handleOpenStatusModal = (user) => {
    setSelectedUser(user);
    setNewStatus(user.accountStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE');
    setStatusReason('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      await adminService.updateUserStatus(selectedUser.userId, newStatus, statusReason);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">User Directory & Access Control</h1>
          <p className="page-subheading">
            Audit synthetic customer profiles, manage authentication privileges, and block suspicious accounts
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem' }}>
          <form onSubmit={handleSearchSubmit} className="filters-grid">
            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label-xs">Search by Name or Email</label>
              <div className="input-with-icon">
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Aarav, diya@fincore.demo"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label-xs">Status</label>
              <select
                className="form-control form-control-sm"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                Search
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { setQuery(''); setStatus(''); setPage(0); }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} />
            <strong style={{ fontSize: '1.05rem' }}>Registered Users</strong>
          </div>
          <span className="badge badge-neutral">{totalElements} Records</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <LoadingSkeleton count={5} height="40px" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Registered At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                        No user records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.userId}>
                        <td><code>#{u.userId}</code></td>
                        <td><strong>{u.fullName}</strong></td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{u.email}</span></td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          {(u.roles || []).map(r => (
                            <span key={r} className={`badge ${r === 'ADMIN' ? 'badge-danger' : 'badge-primary'}`} style={{ marginRight: '4px' }}>
                              {r}
                            </span>
                          ))}
                        </td>
                        <td>
                          <Badge status={u.accountStatus} />
                        </td>
                        <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {formatDateTime(u.createdAt)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-xs ${u.accountStatus === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => handleOpenStatusModal(u)}
                          >
                            {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </button>
              <span className="page-indicator">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modify Status Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Modify Status for ${selectedUser.fullName}`}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={submitting}
              >
                {submitting ? 'Applying Change in MySQL...' : 'Confirm Status Update'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleUpdateStatus}>
            <div className="form-group">
              <label className="form-label">Target User</label>
              <input
                type="text"
                className="form-control"
                value={`${selectedUser.fullName} (${selectedUser.email})`}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newStatus">New Account Status</label>
              <select
                id="newStatus"
                className="form-control"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE (Full access)</option>
                <option value="BLOCKED">BLOCKED (Access suspended)</option>
                <option value="PENDING">PENDING (Awaiting verification)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="statusReason">Reason for Administrative Action</label>
              <textarea
                id="statusReason"
                className="form-control"
                rows={3}
                placeholder="e.g. Audit verification request, simulated risk test"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserManagementPage;
