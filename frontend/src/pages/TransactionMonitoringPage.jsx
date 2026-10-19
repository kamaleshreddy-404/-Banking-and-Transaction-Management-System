import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  Activity, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Eye 
} from 'lucide-react';

const TransactionMonitoringPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, [page, status, type]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getTransactions({
        page,
        size: 15,
        query: query.trim() || undefined,
        status: status || undefined,
        type: type || undefined
      });
      setTransactions(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadTransactions();
  };

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Live Transaction Monitoring</h1>
          <p className="page-subheading">
            Audit high-throughput financial transactions across all virtual accounts in real time
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem' }}>
          <form onSubmit={handleSearchSubmit} className="filters-grid">
            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label-xs">Search Reference or Description</label>
              <div className="input-with-icon">
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. TX-20261020, invoice, demo"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label-xs">Transaction Type</label>
              <select
                className="form-control form-control-sm"
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(0); }}
              >
                <option value="">All Types</option>
                <option value="TRANSFER">TRANSFER</option>
                <option value="DEPOSIT">DEPOSIT</option>
                <option value="WITHDRAWAL">WITHDRAWAL</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label-xs">Status</label>
              <select
                className="form-control form-control-sm"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                Search
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { setQuery(''); setStatus(''); setType(''); setPage(0); }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} />
            <strong style={{ fontSize: '1.05rem' }}>Master Transaction Registry</strong>
          </div>
          <span className="badge badge-neutral">{totalElements} Total Transactions</span>
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
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Source Account</th>
                    <th>Destination Account</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Status</th>
                    <th>Idempotency Key</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.transactionId}>
                        <td><code>{tx.transactionReference}</code></td>
                        <td><strong>{tx.transactionType}</strong></td>
                        <td>{tx.sourceAccountNumber || 'System / Deposit'}</td>
                        <td>{tx.destinationAccountNumber || 'Self / Adjustment'}</td>
                        <td>
                          <strong>{formatCurrency(tx.amount, tx.currencyCode)}</strong>
                        </td>
                        <td>{tx.currencyCode}</td>
                        <td>
                          <Badge status={tx.status} />
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {tx.idempotencyKey ? `${tx.idempotencyKey.slice(0, 16)}...` : 'N/A'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {formatDateTime(tx.createdAt)}
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

export default TransactionMonitoringPage;
