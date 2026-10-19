import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired') === 'true';

  const fillDemoCreds = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      const res = await login(email, password);
      if (res.role === 'ADMIN' || (res.roles && res.roles.includes('ADMIN'))) {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <img src="/logo.svg" alt="FinCore Logo" width="48" height="48" />
          <h2 className="auth-title">Sign In to FinCore</h2>
          <p className="auth-subtitle">Simulated Online Banking & Financial Portal</p>
        </div>

        {isExpired && (
          <div className="alert alert-warning">
            <AlertCircle size={16} /> Your session has expired. Please sign in again.
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="demo-credentials-box">
          <div className="demo-cred-title">
            <UserCheck size={14} /> Quick Demo Accounts (One-Click Auto-Fill)
          </div>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => fillDemoCreds('aarav.sharma@fincore.demo', 'Password@123')}
            >
              Customer: Aarav Sharma
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => fillDemoCreds('diya.patel@fincore.demo', 'Password@123')}
            >
              Customer: Diya Patel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => fillDemoCreds('admin@fincore.demo', 'Admin@12345')}
            >
              Admin: Super Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="name@fincore.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="form-link-sm">Forgot password?</Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Authenticating with Backend...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-card-footer">
          <span>New to FinCore?</span>
          <Link to="/register" className="auth-footer-link">Open a Virtual Account</Link>
        </div>

        <div className="demo-notice-tag">
          <ShieldCheck size={12} /> Real banking credentials are never requested or used.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
