import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [tokenInfo, setTokenInfo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setError('');
      setMessage('');
      setSubmitting(true);
      const res = await authService.forgotPassword(email);
      setMessage(res.message || 'Password reset instructions have been generated.');
      if (res.data && res.data.resetToken) {
        setTokenInfo(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to request password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <img src="/logo.svg" alt="FinCore Logo" width="48" height="48" />
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Simulated password reset recovery</p>
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

        {tokenInfo && (
          <div className="demo-credentials-box" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>
              <strong>Educational Simulation Token:</strong> In this demo environment, no external email server is required. Click below to proceed with your reset token:
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <Link 
                to={`/reset-password?token=${encodeURIComponent(tokenInfo)}`}
                className="btn btn-sm btn-success"
              >
                Reset Password With Token →
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Registered Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="aarav.sharma@fincore.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Generating Reset Token...' : 'Request Password Reset'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-card-footer">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
