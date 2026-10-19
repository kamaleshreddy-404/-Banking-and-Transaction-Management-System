import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Server, 
  Database, 
  Lock, 
  Layers, 
  CheckCircle, 
  ShieldCheck, 
  FileCode, 
  GitBranch 
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1000px' }}>
      <div className="page-header text-center" style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-primary">TECHNICAL ARCHITECTURE SPECIFICATION</span>
        <h1 style={{ fontSize: '2.25rem', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
          FinCore Engineering Principles
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto' }}>
          A production-patterned core banking and ledger architecture built to showcase advanced Java full-stack competencies.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database className="text-primary" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>1. Double-Entry Accounting & Mathematical Invariant</h2>
          </div>
        </div>
        <div className="card-body">
          <p>
            In real core banking systems, an account balance is never merely an arbitrary number in a single database row. Instead, every financial movement produces immutable ledger entries where:
          </p>
          <div style={{ background: 'var(--neutral-100)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', margin: '1rem 0' }}>
            ∑(DEBITS) - ∑(CREDITS) = 0.00 (Zero Discrepancy Reconciliation)
          </div>
          <p>
            FinCore's <code>transaction_ledger</code> table stores synchronized debit and credit entries with running balances and timestamps. Financial entries are strictly <strong>append-only</strong>; ledger records can never be updated or deleted, fulfilling fundamental audit and regulatory requirements.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lock className="text-warning" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>2. Concurrency Control & Deadlock Prevention</h2>
          </div>
        </div>
        <div className="card-body">
          <p>
            When two concurrent transfers occur between Account A and Account B in opposite directions simultaneously, naive database locking causes circular deadlocks:
          </p>
          <ul>
            <li>Thread 1 locks Account A and waits for Account B.</li>
            <li>Thread 2 locks Account B and waits for Account A.</li>
          </ul>
          <p>
            <strong>FinCore Solution:</strong> <code>TransferServiceImpl</code> implements canonical ordered locking:
          </p>
          <div style={{ background: 'var(--neutral-100)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', margin: '1rem 0' }}>
            Long firstId = Math.min(sourceId, destId);<br />
            Long secondId = Math.max(sourceId, destId);<br />
            accountRepository.findAccountForUpdate(firstId);<br />
            accountRepository.findAccountForUpdate(secondId);
          </div>
          <p>
            Because all threads acquire row locks in identical ID order, circular wait conditions are mathematically impossible.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Server className="text-success" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>3. Idempotency & Network Resilience</h2>
          </div>
        </div>
        <div className="card-body">
          <p>
            Payment endpoints must be idempotent. If a mobile app or browser retries an HTTP request due to a transient WiFi timeout, funds must not be debited twice.
          </p>
          <p>
            FinCore enforces this by inspecting the <code>Idempotency-Key</code> header. When a matching key exists in <code>transactions.idempotency_key</code>, the backend returns the original confirmed transaction result without re-executing balance mutations.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck className="text-danger" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>4. Security, Audit Trail & Flyway Migrations</h2>
          </div>
        </div>
        <div className="card-body">
          <ul style={{ lineHeight: '1.8' }}>
            <li><strong>Spring Security 6:</strong> Stateless JWT token validation with role hierarchies and fine-grained method security.</li>
            <li><strong>BCrypt Hashing:</strong> Passwords hashed with salt factor 12.</li>
            <li><strong>Audit Logs:</strong> Every authentication, limit adjustment, and administrative intervention records IP address, timestamp, action code, and user ID.</li>
            <li><strong>Flyway Migrations:</strong> Versioned SQL scripts ensure automated, reproducible database initialization across any clean environment.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
