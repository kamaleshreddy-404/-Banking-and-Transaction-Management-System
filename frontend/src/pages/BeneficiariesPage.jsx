import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import beneficiaryService from '../services/beneficiaryService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { 
  Users, 
  UserPlus, 
  ArrowRightLeft, 
  Trash2, 
  Power, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Search
} from 'lucide-react';

const BeneficiariesPage = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryName: '',
    beneficiaryAccountNumber: '',
    nickname: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await beneficiaryService.getBeneficiaries();
      setBeneficiaries(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch beneficiaries.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    if (!formData.beneficiaryName || !formData.beneficiaryAccountNumber) {
      setFormError('Please enter both beneficiary name and account number.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      await beneficiaryService.addBeneficiary({
        beneficiaryName: formData.beneficiaryName.trim(),
        beneficiaryAccountNumber: formData.beneficiaryAccountNumber.trim(),
        nickname: formData.nickname.trim()
      });
      setShowAddModal(false);
      setFormData({ beneficiaryName: '', beneficiaryAccountNumber: '', nickname: '' });
      await loadBeneficiaries();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register beneficiary.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await beneficiaryService.toggleBeneficiary(id);
      await loadBeneficiaries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your beneficiaries?`)) {
      return;
    }
    try {
      await beneficiaryService.deleteBeneficiary(id);
      await loadBeneficiaries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete beneficiary');
    }
  };

  const filtered = beneficiaries.filter(b => 
    b.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.beneficiaryAccountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.nickname && b.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Saved Beneficiaries</h1>
          <p className="page-subheading">
            Manage your verified recipients for fast, recurring simulated transfers
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={16} /> Add Beneficiary
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '0.75rem 1rem' }}>
          <div className="input-with-icon">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by recipient name, nickname, or account number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Beneficiaries Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height="120px" />
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '3rem 1rem' }}>
            <Users size={40} className="text-muted" style={{ marginBottom: '1rem' }} />
            <h3>No Beneficiaries Found</h3>
            <p className="text-muted" style={{ maxWidth: '450px', margin: '0 auto 1.5rem' }}>
              Add a recipient's 10-digit virtual account number to initiate instant transfers.
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus size={16} /> Add First Beneficiary
            </button>
          </div>
        </div>
      ) : (
        <div className="accounts-cards-grid">
          {filtered.map(b => (
            <div key={b.beneficiaryId} className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{b.beneficiaryName}</h3>
                  {b.nickname && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      "{b.nickname}"
                    </span>
                  )}
                </div>
                <Badge status={b.status} />
              </div>

              <div className="card-body">
                <div className="account-number-box">
                  <span className="account-number-label">RECIPIENT ACCOUNT NUMBER</span>
                  <div className="account-number-val">
                    <code>{b.beneficiaryAccountNumber}</code>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  Registered virtual destination in FinCore database.
                </div>
              </div>

              <div className="card-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/transfer`)}
                  disabled={b.status !== 'ACTIVE'}
                >
                  <ArrowRightLeft size={14} /> Send Funds
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleToggle(b.beneficiaryId)}
                  title={b.status === 'ACTIVE' ? 'Disable Beneficiary' : 'Enable Beneficiary'}
                >
                  <Power size={16} className={b.status === 'ACTIVE' ? 'text-warning' : 'text-success'} />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleDelete(b.beneficiaryId, b.beneficiaryName)}
                  title="Delete Beneficiary"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Beneficiary Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Beneficiary"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddBeneficiary}
              disabled={submitting}
            >
              {submitting ? 'Verifying Account in MySQL...' : 'Save Beneficiary'}
            </button>
          </div>
        }
      >
        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {formError}
          </div>
        )}

        <form onSubmit={handleAddBeneficiary}>
          <div className="form-group">
            <label className="form-label" htmlFor="beneficiaryAccountNumber">10-Digit Virtual Account Number *</label>
            <input
              id="beneficiaryAccountNumber"
              type="text"
              className="form-control"
              placeholder="e.g. FC10020001"
              value={formData.beneficiaryAccountNumber}
              onChange={(e) => setFormData({ ...formData, beneficiaryAccountNumber: e.target.value })}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Must correspond to an existing virtual account in the FinCore system.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="beneficiaryName">Beneficiary Full Name *</label>
            <input
              id="beneficiaryName"
              type="text"
              className="form-control"
              placeholder="e.g. Diya Patel"
              value={formData.beneficiaryName}
              onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nickname">Nickname (Optional)</label>
            <input
              id="nickname"
              type="text"
              className="form-control"
              placeholder="e.g. Sister, Landlord"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            />
          </div>

          <div className="demo-notice-tag" style={{ marginTop: '1rem' }}>
            <ShieldCheck size={14} /> Beneficiary details are securely bound to your user ID. In accordance with banking safety rules, adding a beneficiary never authorizes automatic fund movement without your confirmation.
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BeneficiariesPage;
