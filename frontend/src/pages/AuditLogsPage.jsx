import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  AlertCircle,
  Filter 
} from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadLogs();
  }, [page, action]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getAuditLogs({
        page,
        size: 15,
        action: action || undefined
      });
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Security & Operational Audit Logs</h1>
          <p className="page-subheading">
            Comprehensive audit trail recording authentication attempts, financial mutations, and administrative actions
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Filter by Action Type:
            </label>
            <select
              className="form-control form-control-sm"
              style={{ maxWidth: '280px' }}
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(0); }}
            >
              <option value="">All Audit Events</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="TRANSFER_EXECUTED">TRANSFER_EXECUTED</option>
              <option value="USER_REGISTERED">USER_REGISTERED</option>
              <option value="ACCOUNT_STATUS_CHANGE">ACCOUNT_STATUS_CHANGE</option>
              <option value="LIMIT_UPDATED">LIMIT_UPDATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} />
            <strong style={{ fontSize: '1.05rem' }}>Immutable Audit Trail</strong>
          </div>
          <span className="badge badge-neutral">{totalElements} Logged Events</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <LoadingSkeleton count={6} height="40px" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Action</th>
                    <th>User ID</th>
                    <th>IP Address</th>
                    <th>Details</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                        No audit records recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.auditLogId}>
                        <td><code>#{log.auditLogId}</code></td>
                        <td>
                          <span className={`badge ${
                            log.action?.includes('SUCCESS') ? 'badge-success' :
                            log.action?.includes('FAILED') ? 'badge-danger' : 'badge-primary'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.userId ? <code>User #{log.userId}</code> : 'System / Anonymous'}</td>
                        <td><code>{log.ipAddress || '127.0.0.1'}</code></td>
                        <td style={{ fontSize: '0.825rem', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.details || 'N/A'}
                        </td>
                        <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {formatDateTime(log.createdAt)}
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
    </div>
  );
};

export default AuditLogsPage;
