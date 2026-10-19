import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  Wallet, 
  PlusCircle, 
  ArrowRightLeft, 
  Eye, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(null);

  // New account form state
  const [newAccount, setNewAccount] = useState({
    accountTypeId: 1, // 1 = SAVINGS, 2 = CURRENT
    accountName: '',
    currencyCode: 'INR'
  });
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await accountService.getAccounts();
      setAccounts(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch accounts from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (accNum) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAcc(accNum);
    setTimeout(() => setCopiedAcc(null), 2000);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await accountService.createAccount({
        accountTypeId: parseInt(newAccount.accountTypeId, 10),
        accountName: newAccount.accountName || (newAccount.accountTypeId === 1 ? 'Primary Savings' : 'Business Current'),
        currencyCode: newAccount.currencyCode
      });
      setShowCreateModal(false);
      setNewAccount({ accountTypeId: 1, accountName: '', currencyCode: 'INR' });
      await loadAccounts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open account');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <LoadingSkeleton count={3} height="120px" />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Virtual Bank Accounts</h1>
          <p className="page-subheading">
            Manage your simulated deposit accounts and view immutable double-entry ledger audits
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusCircle size={16} /> Open New Virtual Account
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="accounts-cards-grid">
        {accounts.map(acc => (
          <div key={acc.accountId} className="card account-detail-card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="account-icon-box">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{acc.accountName}</h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                    {acc.accountType}
                  </span>
                </div>
              </div>
              <Badge status={acc.accountStatus} />
            </div>

            <div className="card-body">
              <div className="account-number-box">
                <span className="account-number-label">ACCOUNT NUMBER</span>
                <div className="account-number-val">
                  <code>{acc.accountNumber}</code>
                  <button
                    type="button"
                    className="copy-btn-xs"
                    onClick={() => handleCopy(acc.accountNumber)}
                    title="Copy Account Number"
                  >
                    {copiedAcc === acc.accountNumber ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="account-balance-large">
                <span className="balance-caption">AVAILABLE VIRTUAL BALANCE</span>
                <div className="balance-val">
                  {formatCurrency(acc.balance, acc.currencyCode)}
                </div>
              </div>

              <div className="account-meta-details">
                <div className="meta-row">
                  <span>Currency:</span>
                  <strong>{acc.currencyCode}</strong>
                </div>
                <div className="meta-row">
                  <span>Opened At:</span>
                  <span>{formatDateTime(acc.openedAt)}</span>
                </div>
              </div>
            </div>

            <div className="card-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
              <Link 
                to={`/accounts/${acc.accountId}`} 
                className="btn btn-sm btn-outline-primary"
                style={{ flex: 1 }}
              >
                <Eye size={14} /> View Double-Entry Ledger
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{ flex: 1 }}
                onClick={() => navigate(`/transfer?source=${acc.accountId}`)}
                disabled={acc.accountStatus !== 'ACTIVE'}
              >
                <ArrowRightLeft size={14} /> Transfer Funds
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Open Account Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Open Additional Virtual Account"
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
              onClick={handleCreateAccount}
              disabled={creating}
            >
              {creating ? 'Creating Account in MySQL...' : 'Open Account'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateAccount}>
          <div className="form-group">
            <label className="form-label" htmlFor="accountTypeId">Select Account Type</label>
            <select
              id="accountTypeId"
              className="form-control"
              value={newAccount.accountTypeId}
              onChange={(e) => setNewAccount({ ...newAccount, accountTypeId: e.target.value })}
            >
              <option value="1">Virtual Savings Account (Simulated Personal Deposit)</option>
              <option value="2">Virtual Current Account (Simulated Business Operational)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="accountName">Account Nickname / Name</label>
            <input
              id="accountName"
              type="text"
              className="form-control"
              placeholder="e.g. Rainy Day Fund, Daily Spending"
              value={newAccount.accountName}
              onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="currencyCode">Currency</label>
            <input
              id="currencyCode"
              type="text"
              className="form-control"
              value="INR (Indian Rupee - Virtual)"
              disabled
            />
          </div>

          <div className="demo-notice-tag" style={{ marginTop: '1rem' }}>
            <ShieldCheck size={14} /> New account will be generated in MySQL with a unique 10-digit account number and registered to your user profile.
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountsPage;
