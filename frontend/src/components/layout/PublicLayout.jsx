import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import DemoBanner from '../common/DemoBanner';
import { Shield, BookOpen, LogIn, UserPlus } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="public-shell">
      <DemoBanner />
      <header className="public-header">
        <div className="container header-container">
          <Link to="/" className="public-brand">
            <img src="/logo.svg" alt="FinCore Logo" className="navbar-logo" />
            <div className="brand-titles">
              <span className="brand-name">FinCore</span>
              <span className="brand-sub">SIMULATED CORE BANKING</span>
            </div>
          </Link>

          <nav className="public-nav">
            <Link to="/" className="public-nav-link">Home</Link>
            <Link to="/about" className="public-nav-link">Architecture</Link>
            <Link to="/demo-info" className="public-nav-link">Demo Credentials</Link>
          </nav>

          <div className="public-actions">
            <Link to="/login" className="btn btn-outline-primary btn-sm">
              <LogIn size={15} /> Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <UserPlus size={15} /> Open Virtual Account
            </Link>
          </div>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <img src="/logo.svg" alt="FinCore" width="28" height="28" />
              <strong>FinCore</strong>
            </div>
            <p className="footer-desc">
              A high-performance simulated core banking & transaction management platform demonstrating Java 21, Spring Boot 3, MySQL 8 normalized schemas, pessimistic locking, and immutable double-entry ledgering.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/login">Sign In to Online Banking</Link></li>
              <li><Link to="/register">Create Virtual Account</Link></li>
              <li><Link to="/demo-info">Demo User Credentials</Link></li>
              <li><Link to="/about">System Architecture</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Core Concepts</h4>
            <ul>
              <li>ACID Financial Transactions</li>
              <li>Pessimistic Locking & Deadlock Avoidance</li>
              <li>Idempotent API Processing</li>
              <li>Audited Double-Entry Bookkeeping</li>
            </ul>
          </div>

          <div className="footer-col disclaimer-col">
            <h4>Strict Legal Disclaimer</h4>
            <p>
              FinCore is built strictly for educational, research, and portfolio demonstration purposes. All balances, accounts, names, numbers, and fund movements are entirely synthetic and virtual.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} FinCore Banking System. Educational Project for Java Full-Stack Developer Portfolio.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
