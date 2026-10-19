import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import beneficiaryService from '../services/beneficiaryService';
import transferService from '../services/transferService';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateReceiptPdf } from '../utils/receiptGenerator';
import Badge from '../components/common/Badge';
import { 
  ArrowRightLeft, 
  Wallet, 
  UserCheck, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Receipt, 
  ArrowRight,
  Info,
  RefreshCw
} from 'lucide-react';

const TransferPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const preselectedSource = searchParams.get('source');

  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [sourceAccountId, setSourceAccountId] = useState(preselectedSource || '');
  const [recipientType, setRecipientType] = useState('beneficiary'); // 'beneficiary' or 'direct'
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [directAccountNumber, setDirectAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(`tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  // Wizard steps: 'input' -> 'confirm' -> 'success'
  const [step, setStep] = useState('input');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedTx, setCompletedTx] = useState(null);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      setLoading(true);
      setError('');
      const [accs, bens, lims] = await Promise.all([
        accountService.getAccounts(),
        beneficiaryService.getBeneficiaries(),
        transferService.getLimits().catch(() => null)
      ]);

      const activeAccs = (accs || []).filter(a => a.accountStatus === 'ACTIVE');
      setAccounts(activeAccs);
      setBeneficiaries((bens || []).filter(b => b.status === 'ACTIVE'));
      setLimits(lims);

      if (activeAccs.length > 0 && !sourceAccountId) {
        setSourceAccountId(activeAccs[0].accountId.toString());
      }
    } catch (err) {
      setError('Failed to load transfer options: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find(a => a.accountId.toString() === sourceAccountId);
  const selectedBeneficiary = beneficiaries.find(b => b.beneficiaryId.toString() === selectedBeneficiaryId);

  const parsedAmount = parseFloat(amount) || 0;

  const validateTransfer = () => {
    if (!sourceAccountId) return 'Please select a source account.';
    if (recipientType === 'beneficiary' && !selectedBeneficiaryId) {
      return 'Please select a saved beneficiary.';
    }
    if (recipientType === 'direct' && (!directAccountNumber || directAccountNumber.trim().length < 8)) {
      return 'Please enter a valid 10-digit destination account number.';
    }
    if (parsedAmount <= 0) {
      return 'Transfer amount must be greater than zero.';
    }
    if (selectedAccount && parsedAmount > parseFloat(selectedAccount.balance)) {
      return `Insufficient funds. Available balance is ${formatCurrency(selectedAccount.balance)}.`;
    }
    if (limits && limits.perTransactionLimit && parsedAmount > parseFloat(limits.perTransactionLimit)) {
      return `Exceeds single transaction limit of ${formatCurrency(limits.perTransactionLimit)}.`;
    }
    return null;
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    const validationError = validateTransfer();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleExecuteTransfer = async () => {
    try {
      setSubmitting(true);
      setError('');

      const destinationAcc = recipientType === 'beneficiary'
        ? selectedBeneficiary?.beneficiaryAccountNumber
        : directAccountNumber.trim();

      const payload = {
        sourceAccountId: parseInt(sourceAccountId, 10),
        destinationAccountNumber: destinationAcc,
        amount: parsedAmount,
        currencyCode: selectedAccount?.currencyCode || 'INR',
        description: description || 'Simulated Fund Transfer'
      };

      const result = await transferService.executeTransfer(payload, idempotencyKey);
      setCompletedTx(result);
      setStep('success');

      // Refresh accounts in background
      accountService.getAccounts().then(setAccounts);
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed. Please review your balance and limits.');
      setStep('input');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setIdempotencyKey(`tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
    setCompletedTx(null);
    setStep('input');
    setError('');
  };

  if (loading) {
    return <div className="dashboard-content"><p>Loading transfer engine...</p></div>;
  }

  return (
    <div className="dashboard-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-heading">Simulated Fund Transfer</h1>
          <p className="page-subheading">
            Instant virtual inter-account settlement with deadlock-free pessimistic locking
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Step 1: Input Form */}
      {step === 'input' && (
        <div className="card">
          <div className="card-header">
            <h3>Transfer Details</h3>
            <span className="badge badge-primary">Step 1 of 2</span>
          </div>

          <div className="card-body">
            <form onSubmit={handleProceedToReview}>
              {/* Source Account */}
              <div className="form-group">
                <label className="form-label" htmlFor="sourceAccount">From Account *</label>
                <select
                  id="sourceAccount"
                  className="form-control"
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.accountId} value={acc.accountId}>
                      {acc.accountName} ({acc.accountNumber}) — Available: {formatCurrency(acc.balance, acc.currencyCode)}
                    </option>
                  ))}
                </select>
                {selectedAccount && (
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Account Type: <strong>{selectedAccount.accountType}</strong> • Status: <strong>{selectedAccount.accountStatus}</strong>
                  </div>
                )}
              </div>

              {/* Recipient Selection */}
              <div className="form-group">
                <label className="form-label">Transfer Destination *</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="recipientType"
                      value="beneficiary"
                      checked={recipientType === 'beneficiary'}
                      onChange={() => setRecipientType('beneficiary')}
                    />
                    <span>Saved Beneficiary</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="recipientType"
                      value="direct"
                      checked={recipientType === 'direct'}
                      onChange={() => setRecipientType('direct')}
                    />
                    <span>Direct Account Number</span>
                  </label>
                </div>

                {recipientType === 'beneficiary' ? (
                  beneficiaries.length === 0 ? (
                    <div className="alert alert-warning" style={{ fontSize: '0.875rem' }}>
                      No saved beneficiaries found. You can switch to "Direct Account Number" or add a beneficiary from the Beneficiaries tab.
                    </div>
                  ) : (
                    <select
                      className="form-control"
                      value={selectedBeneficiaryId}
                      onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose a Beneficiary --</option>
                      {beneficiaries.map(b => (
                        <option key={b.beneficiaryId} value={b.beneficiaryId}>
                          {b.beneficiaryName} ({b.nickname ? `${b.nickname} - ` : ''}{b.beneficiaryAccountNumber})
                        </option>
                      ))}
                    </select>
                  )
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 10-digit virtual account number (e.g. FC10020001)"
                    value={directAccountNumber}
                    onChange={(e) => setDirectAccountNumber(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Transfer Amount */}
              <div className="form-group">
                <label className="form-label" htmlFor="amount">Transfer Amount (INR) *</label>
                <div className="input-with-icon">
                  <span className="input-prefix" style={{ padding: '0 0.75rem', fontWeight: 600 }}>₹</span>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    className="form-control"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                {limits && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Daily Remaining Limit: <strong>{formatCurrency(limits.dailyLimit)}</strong> • Max Single Transfer: <strong>{formatCurrency(limits.perTransactionLimit)}</strong>
                  </div>
                )}
              </div>

              {/* Transfer Purpose / Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="description">Payment Note / Description</label>
                <input
                  id="description"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Virtual invoice payment, Educational demo transfer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Idempotency Key Info */}
              <div className="demo-credentials-box" style={{ background: 'var(--neutral-100)', borderColor: 'var(--border-color)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>Idempotency-Key:</strong> <code>{idempotencyKey}</code>
                  </span>
                  <button
                    type="button"
                    className="btn-link-xs"
                    onClick={() => setIdempotencyKey(`tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`)}
                    title="Generate new idempotency key"
                  >
                    <RefreshCw size={12} /> Regenerate Key
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Protects against network retries or duplicate debit submissions.
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg">
                Review Virtual Transfer <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Confirm & Review */}
      {step === 'confirm' && (
        <div className="card">
          <div className="card-header">
            <h3>Review Transfer Details</h3>
            <span className="badge badge-warning">Step 2 of 2: Confirmation</span>
          </div>

          <div className="card-body">
            <div className="review-summary-box">
              <div className="review-row">
                <span className="review-label">Transfer Amount:</span>
                <span className="review-value-large">{formatCurrency(parsedAmount)}</span>
              </div>
              <div className="review-divider" />
              <div className="review-row">
                <span className="review-label">From Account:</span>
                <span className="review-value">
                  {selectedAccount?.accountName} (<code>{selectedAccount?.accountNumber}</code>)
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">To Recipient:</span>
                <span className="review-value">
                  {recipientType === 'beneficiary'
                    ? `${selectedBeneficiary?.beneficiaryName} (${selectedBeneficiary?.beneficiaryAccountNumber})`
                    : directAccountNumber}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Transaction Fee:</span>
                <span className="review-value" style={{ color: 'var(--success-color)' }}>
                  ₹0.00 (Simulated Demo Free)
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Remaining Balance After:</span>
                <span className="review-value">
                  {formatCurrency(parseFloat(selectedAccount?.balance || 0) - parsedAmount)}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Payment Description:</span>
                <span className="review-value">{description || 'Simulated Fund Transfer'}</span>
              </div>
            </div>

            <div className="demo-notice-tag" style={{ marginTop: '1.25rem' }}>
              <ShieldCheck size={16} /> Backend will acquire deadlock-free pessimistic locks on both accounts, verify invariants, and generate synchronized DEBIT and CREDIT ledger entries.
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline-secondary"
                style={{ flex: 1 }}
                onClick={() => setStep('input')}
                disabled={submitting}
              >
                Back to Edit
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleExecuteTransfer}
                disabled={submitting}
              >
                {submitting ? 'Executing Atomic MySQL Transfer...' : 'Confirm & Send Funds'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success Voucher */}
      {step === 'success' && completedTx && (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="success-icon-badge" style={{ margin: '0 auto 1rem', width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Transfer Successful!</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Your simulated transaction has been processed and logged in the immutable double-entry ledger.
            </p>

            <div className="receipt-view" style={{ maxWidth: '500px', margin: '0 auto 1.5rem', textAlign: 'left', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div className="receipt-row">
                <span>Reference ID:</span>
                <code>{completedTx.transactionReference}</code>
              </div>
              <div className="receipt-row">
                <span>Amount Debited:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                  {formatCurrency(completedTx.amount, completedTx.currencyCode)}
                </strong>
              </div>
              <div className="receipt-row">
                <span>Status:</span>
                <Badge status={completedTx.status} />
              </div>
              <div className="receipt-row">
                <span>Source Account:</span>
                <span>{completedTx.sourceAccountNumber}</span>
              </div>
              <div className="receipt-row">
                <span>Destination Account:</span>
                <span>{completedTx.destinationAccountNumber}</span>
              </div>
              <div className="receipt-row">
                <span>Timestamp:</span>
                <span>{new Date(completedTx.createdAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => generateReceiptPdf(completedTx)}
              >
                <Receipt size={16} /> Print / Save Voucher
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={resetForm}
              >
                Make Another Transfer
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/transactions')}
              >
                View in History →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferPage;
