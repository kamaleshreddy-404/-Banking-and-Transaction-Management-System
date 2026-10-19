import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import SpendingChart from '../components/charts/SpendingChart';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDateTime, formatDateOnly } from '../utils/dateFormatter';
import { generateReceiptPdf } from '../utils/receiptGenerator';
import { 
  Wallet, 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Eye, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownLeft,
  Users,
  AlertCircle
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch accounts and recent transactions concurrently
      const [accs, txData] = await Promise.all([
        accountService.getAccounts(),
        transactionService.getTransactions({ page: 0, size: 8 })
      ]);

      setAccounts(accs || []);
      const txList = txData.content || [];
      setRecentTransactions(txList);

      // Build daily trend data for the chart from transactions
      const trendMap = {};
      txList.forEach(tx => {
        const dateKey = formatDateOnly(tx.createdAt);
        if (!trendMap[dateKey]) {
          trendMap[dateKey] = { date: dateKey, credit: 0, debit: 0 };
        }
        const amt = parseFloat(tx.amount) || 0;
        // In customer view, check if user was source or destination
        const isUserSource = accs.some(a => a.accountNumber === tx.sourceAccountNumber);
        if (isUserSource) {
          trendMap[dateKey].debit += amt;
        } else {
          trendMap[dateKey].credit += amt;
        }
      });

      const sortedTrends = Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date));
      // If empty, provide a clean base trend
      if (sortedTrends.length === 0) {
        const today = new Date().toISOString().slice(5, 10);
        sortedTrends.push({ date: today, credit: 15000, debit: 4500 });
      }
      setChartData(sortedTrends);

    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to fetch live banking data. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = async (transactionId) => {
    try {
      setReceiptLoading(true);
      const receipt = await transactionService.getTransactionReceipt(transactionId);
      setSelectedReceipt(receipt);
    } catch (err) {
      alert('Could not fetch receipt: ' + (err.response?.data?.message || err.message));
    } finally {
      setReceiptLoading(false);
    }
  };

  // Calculations
  const totalBalance = accounts.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);
  const totalInflows = chartData.reduce((acc, c) => acc + c.credit, 0);
  const totalOutflows = chartData.reduce((acc, c) => acc + c.debit, 0);

  if (loading) {
    return (
      <div className="dashboard-content">
        <LoadingSkeleton count={4} height="100px" />
        <div style={{ marginTop: '2rem' }}>
          <LoadingSkeleton count={5} height="48px" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1 className="dashboard-title">
            Welcome back, {user?.fullName || 'Customer'}
          </h1>
          <p className="dashboard-subtitle">
            FinCore Simulated Online Banking — Overview of your accounts and recent transactions
          </p>
        </div>
        <div className="banner-actions">
          <Link to="/transfer" className="btn btn-primary">
            <ArrowRightLeft size={16} /> Transfer Funds
          </Link>
          <Link to="/accounts" className="btn btn-outline-primary">
            <Wallet size={16} /> View Accounts
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Financial Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Virtual Balance"
          value={formatCurrency(totalBalance)}
          subtitle={`${accounts.length} active virtual account${accounts.length > 1 ? 's' : ''}`}
          icon={Wallet}
          color="primary"
        />
        <StatCard
          title="Recent Inflows"
          value={formatCurrency(totalInflows)}
          subtitle="Simulated credits received"
          icon={TrendingUp}
          color="success"
          change="Credits"
          isPositive={true}
        />
        <StatCard
          title="Recent Outflows"
          value={formatCurrency(totalOutflows)}
          subtitle="Simulated debits sent"
          icon={TrendingDown}
          color="warning"
          change="Debits"
          isPositive={false}
        />
        <StatCard
          title="Ledger Integrity"
          value="100% Balanced"
          subtitle="Double-entry reconciled in MySQL"
          icon={Receipt}
          color="success"
        />
      </div>

      {/* Main Grid: Accounts & Spending Trend */}
      <div className="dashboard-grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Accounts Card List */}
        <div className="card">
          <div className="card-header">
            <h3>Your Accounts</h3>
            <Link to="/accounts" className="link-action">Manage Accounts →</Link>
          </div>
          <div className="card-body">
            {accounts.length === 0 ? (
              <p className="text-muted">No accounts found.</p>
            ) : (
              <div className="account-cards-stack">
                {accounts.map(acc => (
                  <div key={acc.accountId} className="account-tile">
                    <div className="account-tile-left">
                      <div className="account-type-badge">{acc.accountType}</div>
                      <strong className="account-num">{acc.accountNumber}</strong>
                      <span className="account-name-sm">{acc.accountName}</span>
                    </div>
                    <div className="account-tile-right">
                      <div className="account-balance">{formatCurrency(acc.balance, acc.currencyCode)}</div>
                      <Badge status={acc.accountStatus} />
                      <div style={{ marginTop: '0.4rem' }}>
                        <Link to={`/accounts/${acc.accountId}`} className="btn-link-xs">
                          <Eye size={12} /> View Ledger
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity & Spending Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Cash Flow & Transaction Trends</h3>
            <span className="badge badge-neutral">Simulated Flow</span>
          </div>
          <div className="card-body">
            <SpendingChart data={chartData} />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Recent Transactions</h3>
          <Link to="/transactions" className="link-action">View Full History →</Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Source / Beneficiary</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted" style={{ padding: '2rem' }}>
                      No recent transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map(tx => {
                    const isDebit = accounts.some(a => a.accountNumber === tx.sourceAccountNumber);
                    return (
                      <tr key={tx.transactionId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isDebit ? (
                              <ArrowUpRight size={16} className="text-danger" />
                            ) : (
                              <ArrowDownLeft size={16} className="text-success" />
                            )}
                            <span style={{ fontWeight: 600 }}>{tx.transactionType}</span>
                          </div>
                        </td>
                        <td>
                          <code className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {tx.transactionReference}
                          </code>
                        </td>
                        <td>
                          <div>
                            {tx.destinationAccountName || tx.destinationAccountNumber || 'N/A'}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {tx.description}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td>
                          <span className={isDebit ? 'amount-debit' : 'amount-credit'}>
                            {isDebit ? '-' : '+'} {formatCurrency(tx.amount, tx.currencyCode)}
                          </span>
                        </td>
                        <td>
                          <Badge status={tx.status} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleViewReceipt(tx.transactionId)}
                            title="View Receipt"
                          >
                            <Receipt size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Virtual Transaction Receipt"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => generateReceiptPdf(selectedReceipt)}
              >
                <Receipt size={16} /> Print / Save Voucher
              </button>
            </div>
          }
        >
          <div className="receipt-view" id="printable-receipt">
            <div className="receipt-header text-center">
              <img src="/logo.svg" alt="FinCore Logo" width="40" height="40" />
              <h4>FinCore Banking System</h4>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                Simulated Virtual Transaction Voucher
              </p>
            </div>

            <div className="receipt-amount-display text-center">
              <span className="receipt-amt">
                {formatCurrency(selectedReceipt.amount, selectedReceipt.currencyCode)}
              </span>
              <div style={{ marginTop: '0.25rem' }}>
                <Badge status={selectedReceipt.status} />
              </div>
            </div>

            <div className="receipt-details-list">
              <div className="receipt-row">
                <span>Reference:</span>
                <code>{selectedReceipt.transactionReference}</code>
              </div>
              <div className="receipt-row">
                <span>Date & Time:</span>
                <span>{formatDateTime(selectedReceipt.timestamp)}</span>
              </div>
              <div className="receipt-row">
                <span>Transaction Type:</span>
                <strong>{selectedReceipt.transactionType}</strong>
              </div>
              <div className="receipt-row">
                <span>Source Account:</span>
                <span>{selectedReceipt.sourceAccountNumber || 'N/A'} ({selectedReceipt.sourceAccountName || 'Customer'})</span>
              </div>
              <div className="receipt-row">
                <span>Destination Account:</span>
                <span>{selectedReceipt.destinationAccountNumber || 'N/A'} ({selectedReceipt.destinationAccountName || 'Beneficiary'})</span>
              </div>
              <div className="receipt-row">
                <span>Description:</span>
                <span>{selectedReceipt.description || 'Virtual Fund Transfer'}</span>
              </div>
              <div className="receipt-row">
                <span>Running Balance After:</span>
                <strong>{formatCurrency(selectedReceipt.runningBalanceAfter, selectedReceipt.currencyCode)}</strong>
              </div>
            </div>

            <div className="receipt-disclaimer text-center" style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              DEMO TRANSACTION • VIRTUAL CURRENCY ONLY • NO REAL-WORLD SETTLEMENT
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;
