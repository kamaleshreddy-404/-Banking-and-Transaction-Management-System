import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    accountType: 'SAVINGS'
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!agreed) {
      setError('Please acknowledge the simulated demo environment disclaimer.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        addressLine: formData.addressLine,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        accountType: formData.accountType
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container register-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-card-header">
          <img src="/logo.svg" alt="FinCore Logo" width="48" height="48" />
          <h2 className="auth-title">Open a Virtual Bank Account</h2>
          <p className="auth-subtitle">Join FinCore's simulated financial environment</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Legal Name *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Verma"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="rahul.verma@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Synthetic Phone</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="accountType">Initial Account Type</label>
              <select
                id="accountType"
                name="accountType"
                className="form-control"
                value={formData.accountType}
                onChange={handleChange}
              >
                <option value="SAVINGS">Virtual Savings Account (₹10,000 welcome credit)</option>
                <option value="CURRENT">Virtual Current Account (₹25,000 welcome credit)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                className="form-control"
                placeholder="Mumbai"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                className="form-control"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="postalCode">Postal Code</label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                className="form-control"
                placeholder="400001"
                value={formData.postalCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-check-box">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
              />
              <span className="checkbox-label">
                I understand and agree that FinCore is a <strong>simulated educational banking sandbox</strong>. All accounts, balances, and transactions use virtual test money with zero monetary value.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Creating Virtual Account in MySQL...' : 'Create My Account'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-card-footer">
          <span>Already have a test account?</span>
          <Link to="/login" className="auth-footer-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
