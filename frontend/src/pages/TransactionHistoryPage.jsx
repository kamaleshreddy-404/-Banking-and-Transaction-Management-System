import React, { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import accountService from '../services/accountService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDateTime } from '../utils/dateFormatter';
import { generateReceiptPdf } from '../utils/receiptGenerator';
import { 
  History, 
  Filter, 
  Download, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw,
  Search,
  AlertCircle
} from 'lucide-react';

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Receipt modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    accountService.getAccounts().then(setAccounts).catch(() => {});
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [page, selectedAccount, selectedType, selectedStatus, startDate, endDate]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await transactionService.getTransactions({
        page,
        size: 15,
        accountId: selectedAccount || undefined,
        type: selectedType || undefined,
        status: selectedStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setTransactions(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedAccount('');
    setSelectedType('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['Reference', 'Type', 'Amount', 'Currency', 'Status', 'Source Account', 'Destination Account', 'Description', 'Timestamp'];
    const rows = transactions.map(tx => [
      `"${tx.transactionReference}"`,
      `"${tx.transactionType}"`,
      tx.amount,
      `"${tx.currencyCode}"`,
      `"${tx.status}"`,
      `"${tx.sourceAccountNumber || ''}"`,
      `"${tx.destinationAccountNumber || ''}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${tx.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinCore_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewReceipt = async (transactionId) => {
    try {
      const receipt = await transactionService.getTransactionReceipt(transactionId);
      setSelectedReceipt(receipt);
    } catch (err) {
      alert('Could not fetch receipt: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Transaction History</h1>
          <p className="page-subheading">
            Filter, inspect, and export your virtual statements and proof of payment
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleExportCsv}
          disabled={transactions.length === 0}
        >
          <Download size={16} /> Export CSV Statement
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem' }}>
          <div className="filters-grid">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label-xs">Filter by Account</label>
              <select
                className="form-control form-control-sm"
                value={selectedAccount}
                onChange={(e) => { setSelectedAccount(e.target.value); setPage(0); }}
              >
                <option value="">All Accounts</option>
                {accounts.map(acc => (
                  <option key={acc.accountId} value={acc.accountId}>
                    {acc.accountName} ({acc.accountNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label-xs">Transaction Type</label>
              <select
                className="form-control form-control-sm"
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setPage(0); }}
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
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label-xs">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label-xs">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={handleResetFilters}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} />
            <span style={{ fontWeight: 600 }}>Ledger-Backed Transactions</span>
          </div>
          <span className="badge badge-neutral">{totalElements} Total Records</span>
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
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Source Account</th>
                    <th>Destination Account</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                    <th>Voucher</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                        No transactions matched the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(tx => {
                      const isDebit = accounts.some(a => a.accountNumber === tx.sourceAccountNumber);
                      return (
                        <tr key={tx.transactionId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {isDebit ? (
                                <ArrowUpRight size={15} className="text-danger" />
                              ) : (
                                <ArrowDownLeft size={15} className="text-success" />
                              )}
                              <strong>{tx.transactionType}</strong>
                            </div>
                          </td>
                          <td>
                            <code className="text-muted" style={{ fontSize: '0.8rem' }}>
                              {tx.transactionReference}
                            </code>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {tx.sourceAccountNumber || 'External / System'}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {tx.destinationAccountNumber || 'Self / Adjustment'}
                          </td>
                          <td style={{ fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tx.description}
                          </td>
                          <td>
                            <span className={isDebit ? 'amount-debit' : 'amount-credit'}>
                              {isDebit ? '-' : '+'} {formatCurrency(tx.amount, tx.currencyCode)}
                            </span>
                          </td>
                          <td>
                            <Badge status={tx.status} />
                          </td>
                          <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            {formatDateTime(tx.createdAt)}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleViewReceipt(tx.transactionId)}
                              title="Print / View Receipt"
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
          )}

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

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Virtual Transaction Voucher"
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
          <div className="receipt-view">
            <div className="receipt-header text-center">
              <img src="/logo.svg" alt="FinCore Logo" width="40" height="40" />
              <h4>FinCore Banking System</h4>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                Simulated Core Banking Voucher
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
                <span>Timestamp:</span>
                <span>{formatDateTime(selectedReceipt.timestamp)}</span>
              </div>
              <div className="receipt-row">
                <span>Transaction Type:</span>
                <strong>{selectedReceipt.transactionType}</strong>
              </div>
              <div className="receipt-row">
                <span>Source Account:</span>
                <span>{selectedReceipt.sourceAccountNumber || 'N/A'}</span>
              </div>
              <div className="receipt-row">
                <span>Destination Account:</span>
                <span>{selectedReceipt.destinationAccountNumber || 'N/A'}</span>
              </div>
              <div className="receipt-row">
                <span>Description:</span>
                <span>{selectedReceipt.description || 'Simulated Fund Transfer'}</span>
              </div>
              <div className="receipt-row">
                <span>Running Balance After:</span>
                <strong>{formatCurrency(selectedReceipt.runningBalanceAfter, selectedReceipt.currencyCode)}</strong>
              </div>
            </div>

            <div className="receipt-disclaimer text-center" style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              SIMULATED VIRTUAL VOUCHER • EDUCATIONAL RECONCILIATION ONLY
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
