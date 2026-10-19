import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, KeyRound, UserCheck, ArrowRight, Copy, Check } from 'lucide-react';

const DemoInfoPage = () => {
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  const demoUsers = [
    {
      role: 'ADMIN',
      name: 'Super Admin',
      email: 'admin@fincore.demo',
      pass: 'Admin@12345',
      accounts: 'Administrative Control Account',
      note: 'Full system oversight, user suspension, ledger inspection, and limits management'
    },
    {
      role: 'CUSTOMER',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@fincore.demo',
      pass: 'Password@123',
      accounts: 'FC10010001 (Savings: ₹45,250.00), FC10010002 (Current: ₹1,12,000.00)',
      note: 'Primary demo customer with active beneficiaries and historical transactions'
    },
    {
      role: 'CUSTOMER',
      name: 'Diya Patel',
      email: 'diya.patel@fincore.demo',
      pass: 'Password@123',
      accounts: 'FC10020001 (Savings: ₹28,400.00)',
      note: 'Active beneficiary recipient with multiple completed transfers'
    },
    {
      role: 'CUSTOMER',
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@fincore.demo',
      pass: 'Password@123',
      accounts: 'FC10030001 (Current: ₹2,35,000.00)',
      note: 'High-balance merchant account for business transfer simulations'
    },
    {
      role: 'CUSTOMER',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@fincore.demo',
      pass: 'Password@123',
      accounts: 'FC10040001 (Savings: ₹14,800.00)',
      note: 'Standard customer account'
    },
    {
      role: 'CUSTOMER',
      name: 'Rohan Mehra',
      email: 'rohan.mehra@fincore.demo',
      pass: 'Password@123',
      accounts: 'FC10050001 (Savings: ₹6,500.00 - FROZEN)',
      note: 'Simulated frozen account to demonstrate transfer rejection safety rules'
    }
  ];

  const copyCreds = (email, pass, index) => {
    navigator.clipboard.writeText(`${email}\t${pass}`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1000px' }}>
      <div className="page-header text-center" style={{ marginBottom: '2rem' }}>
        <div className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>
          <ShieldAlert size={14} /> DEMO ENVIRONMENT DIRECTORY
        </div>
        <h1 style={{ fontSize: '2.25rem', margin: '0.5rem 0' }}>Synthetic Test Credentials</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
          Use the pre-seeded credentials below to evaluate customer workflows, simulated fund transfers, or administrator functions.
        </p>
      </div>

      <div className="card" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Name & Email</th>
              <th>Password</th>
              <th>Virtual Accounts</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {demoUsers.map((user, idx) => (
              <tr key={user.email}>
                <td>
                  <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : 'badge-primary'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <strong>{user.name}</strong>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {user.email}
                  </div>
                </td>
                <td>
                  <code style={{ fontSize: '0.85rem' }}>{user.pass}</code>
                </td>
                <td>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {user.accounts}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {user.note}
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => copyCreds(user.email, user.pass, idx)}
                  >
                    {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                    {copiedIndex === idx ? 'Copied' : 'Copy'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <Link to="/login" className="btn btn-primary btn-lg">
          Proceed to Sign In <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default DemoInfoPage;
