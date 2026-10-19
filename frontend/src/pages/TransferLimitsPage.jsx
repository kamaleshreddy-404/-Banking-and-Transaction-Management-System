import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/currencyFormatter';
import { 
  Sliders, 
  Edit3, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

const TransferLimitsPage = () => {
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [editingTier, setEditingTier] = useState(null);
  const [dailyLimit, setDailyLimit] = useState('');
  const [perTransactionLimit, setPerTransactionLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getLimits();
      setLimits(data || []);
    } catch (err) {
      setError('Failed to fetch transfer limit configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (tierData) => {
    setEditingTier(tierData);
    setDailyLimit(tierData.dailyLimit.toString());
    setPerTransactionLimit(tierData.perTransactionLimit.toString());
    setMonthlyLimit(tierData.monthlyLimit.toString());
  };

  const handleSaveLimits = async (e) => {
    e.preventDefault();
    if (!editingTier) return;

    try {
      setSubmitting(true);
      await adminService.updateLimit(editingTier.userTier, {
        dailyLimit: parseFloat(dailyLimit),
        perTransactionLimit: parseFloat(perTransactionLimit),
        monthlyLimit: parseFloat(monthlyLimit)
      });
      setEditingTier(null);
      await loadLimits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update transfer limits');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Transfer Limits & Risk Ceilings</h1>
          <p className="page-subheading">
            Manage per-transaction, daily, and monthly simulated fund transfer boundaries by customer tier
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} height="120px" />
      ) : (
        <div className="accounts-cards-grid">
          {limits.map(lim => (
            <div key={lim.userTier} className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Tier: {lim.userTier}</h3>
                  <span className="badge badge-primary" style={{ marginTop: '4px' }}>
                    Policy Active
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleOpenEdit(lim)}
                >
                  <Edit3 size={14} /> Adjust Policy
                </button>
              </div>

              <div className="card-body">
                <div style={{ marginBottom: '0.75rem' }}>
                  <span className="balance-caption">PER TRANSACTION LIMIT</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(lim.perTransactionLimit)}
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span className="balance-caption">DAILY CUMULATIVE LIMIT</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                    {formatCurrency(lim.dailyLimit)}
                  </div>
                </div>

                <div>
                  <span className="balance-caption">MONTHLY LIMIT</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {formatCurrency(lim.monthlyLimit)}
                  </div>
                </div>
              </div>

              <div className="card-footer" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Enforced server-side during transaction validation.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Limits Modal */}
      {editingTier && (
        <Modal
          isOpen={!!editingTier}
          onClose={() => setEditingTier(null)}
          title={`Adjust Limits for ${editingTier.userTier} Tier`}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setEditingTier(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveLimits}
                disabled={submitting}
              >
                {submitting ? 'Updating Database...' : 'Save Limit Policy'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveLimits}>
            <div className="form-group">
              <label className="form-label" htmlFor="perTransactionLimit">Per-Transaction Max Limit (₹)</label>
              <input
                id="perTransactionLimit"
                type="number"
                step="100"
                className="form-control"
                value={perTransactionLimit}
                onChange={(e) => setPerTransactionLimit(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dailyLimit">Daily Cumulative Limit (₹)</label>
              <input
                id="dailyLimit"
                type="number"
                step="500"
                className="form-control"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="monthlyLimit">Monthly Cumulative Limit (₹)</label>
              <input
                id="monthlyLimit"
                type="number"
                step="1000"
                className="form-control"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TransferLimitsPage;
