import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setError('');
      setMessage('');
      setSubmitting(true);
      const res = await authService.resetPassword(token, newPassword);
      setMessage(res.message || 'Password successfully updated! You can now sign in.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <img src="/logo.svg" alt="FinCore Logo" width="48" height="48" />
          <h2 className="auth-title">Reset Your Password</h2>
          <p className="auth-subtitle">Set a secure new password for your account</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="token">Reset Token</label>
            <input
              id="token"
              type="text"
              className="form-control"
              placeholder="Paste your reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="newPassword"
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Updating Password...' : 'Save New Password'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-card-footer">
          <Link to="/login" className="auth-footer-link">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
