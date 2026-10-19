import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRightLeft, 
  Lock, 
  Database, 
  CheckCircle2, 
  Cpu, 
  Users, 
  Receipt, 
  Layers,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-badge">
            <ShieldCheck size={16} /> 100% Simulated Core Banking Platform
          </div>
          <h1 className="hero-title">
            Enterprise Banking Engine & Transaction Management
          </h1>
          <p className="hero-subtitle">
            Engineered with Java 21, Spring Boot 3, and MySQL 8. Featuring immutable double-entry ledgering, deadlock-free pessimistic locking, and idempotent financial operations.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg">
              Explore Demo Banking <ArrowRight size={18} />
            </Link>
            <Link to="/demo-info" className="btn btn-secondary btn-lg">
              Demo Credentials & Sandbox
            </Link>
          </div>
          
          <div className="hero-stats-banner">
            <div className="stat-item">
              <span className="stat-number">18</span>
              <span className="stat-label">Normalized DB Tables</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Double-Entry Reconciled</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">ACID</span>
              <span className="stat-label">Atomic Pessimistic Locks</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">0.00</span>
              <span className="stat-label">Virtual Financial Exposure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">PORTFOLIO HIGHLIGHTS</span>
            <h2 className="section-heading">Architected Like an Enterprise Core Bank</h2>
            <p className="section-subtext">
              Demonstrating production-grade Java full-stack engineering standards with clean separation of concerns.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon icon-primary">
                <Database size={24} />
              </div>
              <h3>Immutable Double-Entry Ledger</h3>
              <p>
                Every simulated financial movement records synchronized DEBIT and CREDIT entries with strict running balance tracking, guaranteeing mathematical zero-discrepancy reconciliation.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-success">
                <Lock size={24} />
              </div>
              <h3>Deadlock-Free Pessimistic Locking</h3>
              <p>
                Transfers acquire database row-level locks in strictly ordered account ID sequence (`min(A, B)` then `max(A, B)`), preventing circular database deadlocks under high concurrency.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-warning">
                <ArrowRightLeft size={24} />
              </div>
              <h3>Idempotent Execution</h3>
              <p>
                Unique client-generated `Idempotency-Key` headers safeguard against network retries or accidental double-clicks, returning the existing transaction without duplicate balance deduction.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-danger">
                <ShieldCheck size={24} />
              </div>
              <h3>Role-Based Access Control</h3>
              <p>
                Stateless JWT authentication with granular Spring Security 6 role authorization (`CUSTOMER` vs `ADMIN`), comprehensive audit logging, and BCrypt encrypted credentials.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-primary">
                <Receipt size={24} />
              </div>
              <h3>PDF Receipts & Statements</h3>
              <p>
                Instant dynamic transaction receipts with unique reference numbers, masked beneficiary details, currency formatting, and printable visual receipts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-success">
                <Cpu size={24} />
              </div>
              <h3>Production Observability</h3>
              <p>
                Built-in Spring Boot Actuator health endpoints, database connection pool metrics, live audit logs, and an admin monitoring dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <section className="safety-section">
        <div className="container">
          <div className="safety-card">
            <div className="safety-icon">
              <ShieldCheck size={36} />
            </div>
            <div className="safety-content">
              <h3>Strict Educational & Demonstration Sandbox</h3>
              <p>
                FinCore is an independent academic and portfolio project. It uses purely virtual currency, simulated accounts, and synthetic test identities. It has zero connectivity to real payment networks, UPI, cards, or banking institutions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
