import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  ArrowLeft, 
  Wallet, 
  BookOpen, 
  History, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle,
  Receipt
} from 'lucide-react';

const AccountDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' or 'transactions'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination for ledger
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAccountDetails();
  }, [id, page]);

  const loadAccountDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const [accData, ledgerData, txData] = await Promise.all([
        accountService.getAccountById(id),
        accountService.getAccountLedger(id, page, 15),
        transactionService.getTransactions({ accountId: id, page: 0, size: 20 })
      ]);

      setAccount(accData);
      setLedgerEntries(ledgerData.content || []);
      setTotalPages(ledgerData.totalPages || 1);
      setTransactions(txData.content || []);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load account details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !account) {
    return (
      <div className="dashboard-content">
        <LoadingSkeleton count={3} height="80px" />
      </div>
    );
  }

  if (error && !account) {
    return (
      <div className="dashboard-content">
        <div className="alert alert-danger">
          <AlertCircle size={18} /> {error}
        </div>
        <Link to="/accounts" className="btn btn-outline-primary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/accounts" className="btn-link-sm">
          <ArrowLeft size={16} /> Back to My Accounts
        </Link>
      </div>

      {/* Account Summary Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(37,99,235,0.04) 100%)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="account-icon-box">
                  <Wallet size={24} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{account?.accountName}</h1>
                  <span className="badge badge-primary">{account?.accountType}</span>
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                Account No: <strong style={{ color: 'var(--text-primary)' }}>{account?.accountNumber}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="balance-caption">CURRENT BALANCE</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                {formatCurrency(account?.balance, account?.currencyCode)}
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                <Badge status={account?.accountStatus} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Opened on: <strong>{formatDateTime(account?.openedAt)}</strong> • Currency: <strong>{account?.currencyCode}</strong>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/transfer?source=${account.accountId}`)}
              disabled={account?.accountStatus !== 'ACTIVE'}
            >
              <ArrowRightLeft size={14} /> Send Virtual Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          <BookOpen size={16} /> Immutable Double-Entry Ledger ({ledgerEntries.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <History size={16} /> Transactions History ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Ledger */}
      {activeTab === 'ledger' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ margin: 0 }}>Double-Entry Ledger Audit Trail</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Strict append-only ledger entries directly populated by MySQL transactions
              </p>
            </div>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> Synchronized
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Entry ID</th>
                    <th>Entry Type</th>
                    <th>Amount</th>
                    <th>Running Balance</th>
                    <th>Transaction Ref</th>
                    <th>Description</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted" style={{ padding: '2rem' }}>
                        No ledger entries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    ledgerEntries.map(entry => (
                      <tr key={entry.ledgerEntryId}>
                        <td>
                          <code>#{entry.ledgerEntryId}</code>
                        </td>
                        <td>
                          <Badge status={entry.entryType} />
                        </td>
                        <td>
                          <span className={entry.entryType === 'DEBIT' ? 'amount-debit' : 'amount-credit'}>
                            {entry.entryType === 'DEBIT' ? '-' : '+'} {formatCurrency(entry.amount)}
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(entry.runningBalance)}</strong>
                        </td>
                        <td>
                          <code className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {entry.transactionReference || 'N/A'}
                          </code>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{entry.description}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {formatDateTime(entry.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
      )}

      {/* Tab 2: Transactions */}
      {activeTab === 'transactions' && (
        <div className="card">
          <div className="card-header">
            <h3>Account Transactions</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Target Account</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>
                        No transactions found for this account.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.transactionId}>
                        <td>
                          <strong>{tx.transactionType}</strong>
                        </td>
                        <td>
                          <code>{tx.transactionReference}</code>
                        </td>
                        <td>
                          {tx.destinationAccountNumber || tx.sourceAccountNumber || 'Internal Adjustment'}
                        </td>
                        <td>
                          <strong>{formatCurrency(tx.amount, tx.currencyCode)}</strong>
                        </td>
                        <td>
                          <Badge status={tx.status} />
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {formatDateTime(tx.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetailsPage;
