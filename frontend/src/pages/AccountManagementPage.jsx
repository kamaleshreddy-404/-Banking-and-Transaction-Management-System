import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  Building2, 
  Search, 
  Lock, 
  Unlock, 
  AlertCircle, 
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountManagementPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Status Modal
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [page, status]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getAccounts({
        page,
        size: 10,
        query: query.trim() || undefined,
        status: status || undefined
      });
      setAccounts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadAccounts();
  };

  const handleOpenModal = (acc) => {
    setSelectedAccount(acc);
    setNewStatus(acc.accountStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE');
    setReason('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      setSubmitting(true);
      await adminService.updateAccountStatus(selectedAccount.accountId, newStatus, reason);
      setSelectedAccount(null);
      await loadAccounts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update account status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Account Oversight & Risk Control</h1>
          <p className="page-subheading">
            Monitor virtual liquidity across all accounts, inspect balances, and enforce account freezes
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
              <label className="form-label-xs">Search by Account Number or Name</label>
              <div className="input-with-icon">
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. FC10010001, Aarav"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label-xs">Account Status</label>
              <select
                className="form-control form-control-sm"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="FROZEN">FROZEN</option>
                <option value="CLOSED">CLOSED</option>
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

      {/* Accounts Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} />
            <strong style={{ fontSize: '1.05rem' }}>All Virtual Accounts</strong>
          </div>
          <span className="badge badge-neutral">{totalElements} Accounts</span>
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
                    <th>Account No</th>
                    <th>Account Name</th>
                    <th>Account Type</th>
                    <th>Current Balance</th>
                    <th>Currency</th>
                    <th>Status</th>
                    <th>Opened At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                        No accounts match your query.
                      </td>
                    </tr>
                  ) : (
                    accounts.map(acc => (
                      <tr key={acc.accountId}>
                        <td><code>{acc.accountNumber}</code></td>
                        <td><strong>{acc.accountName}</strong></td>
                        <td><span className="badge badge-primary">{acc.accountType}</span></td>
                        <td>
                          <strong>{formatCurrency(acc.balance, acc.currencyCode)}</strong>
                        </td>
                        <td>{acc.currencyCode}</td>
                        <td>
                          <Badge status={acc.accountStatus} />
                        </td>
                        <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {formatDateTime(acc.openedAt)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link 
                              to={`/accounts/${acc.accountId}`} 
                              className="btn btn-xs btn-outline-primary"
                              title="Inspect Ledger"
                            >
                              <Eye size={12} />
                            </Link>
                            <button
                              type="button"
                              className={`btn btn-xs ${acc.accountStatus === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              onClick={() => handleOpenModal(acc)}
                            >
                              {acc.accountStatus === 'ACTIVE' ? 'Freeze' : 'Unfreeze'}
                            </button>
                          </div>
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

      {/* Account Status Modal */}
      {selectedAccount && (
        <Modal
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          title={`Modify Status for Account ${selectedAccount.accountNumber}`}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setSelectedAccount(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={submitting}
              >
                {submitting ? 'Applying Change...' : 'Update Account Status'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleUpdateStatus}>
            <div className="form-group">
              <label className="form-label">Target Account</label>
              <input
                type="text"
                className="form-control"
                value={`${selectedAccount.accountName} (${selectedAccount.accountNumber}) — Balance: ${formatCurrency(selectedAccount.balance)}`}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="accountStatus">New Status</label>
              <select
                id="accountStatus"
                className="form-control"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE (Normal transfers permitted)</option>
                <option value="FROZEN">FROZEN (Transfers blocked; credits permitted)</option>
                <option value="CLOSED">CLOSED (Terminal state)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reason">Reason / Audit Justification</label>
              <textarea
                id="reason"
                className="form-control"
                rows={3}
                placeholder="e.g. Compliance hold demonstration, simulated customer request"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AccountManagementPage;
