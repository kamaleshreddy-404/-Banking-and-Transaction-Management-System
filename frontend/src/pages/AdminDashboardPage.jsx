import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import MonthlyComparisonChart from '../components/charts/MonthlyComparisonChart';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/currencyFormatter';
import { 
  Users, 
  Wallet, 
  Activity, 
  BookOpen, 
  Headphones, 
  HeartPulse, 
  ShieldCheck, 
  Sliders, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sample monthly data for comparison chart
  const monthlyData = [
    { month: 'Jun', deposits: 450000, transfers: 320000 },
    { month: 'Jul', deposits: 520000, transfers: 410000 },
    { month: 'Aug', deposits: 610000, transfers: 490000 },
    { month: 'Sep', deposits: 730000, transfers: 580000 },
    { month: 'Oct', deposits: 850000, transfers: 690000 }
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getAdminStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <LoadingSkeleton count={4} height="100px" />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Administrator Operations Center</h1>
          <p className="page-subheading">
            Live system monitoring, core ledger reconciliation, and risk control
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/admin/health" className="btn btn-outline-primary btn-sm">
            <HeartPulse size={15} /> System Health
          </Link>
          <Link to="/admin/ledger" className="btn btn-primary btn-sm">
            <BookOpen size={15} /> Inspect Ledger
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Admin Stat Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 7}
          subtitle="Customer & staff profiles"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Total Virtual Accounts"
          value={stats?.totalAccounts || 8}
          subtitle="Active deposit accounts"
          icon={Wallet}
          color="success"
        />
        <StatCard
          title="Total Transactions"
          value={stats?.totalTransactions || 37}
          subtitle="Processed ACID transfers"
          icon={Activity}
          color="warning"
        />
        <StatCard
          title="Open Support Inquiries"
          value={stats?.openTickets || 2}
          subtitle="Awaiting response"
          icon={Headphones}
          color="danger"
        />
      </div>

      {/* Monthly Trends & Quick Actions */}
      <div className="dashboard-grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3>Monthly Virtual Volume Trends</h3>
            <span className="badge badge-primary">Aggregated Flow</span>
          </div>
          <div className="card-body">
            <MonthlyComparisonChart data={monthlyData} />
          </div>
        </div>

        {/* Quick Operations Matrix */}
        <div className="card">
          <div className="card-header">
            <h3>Operational Modules</h3>
            <span className="badge badge-neutral">Quick Access</span>
          </div>
          <div className="card-body" style={{ padding: '0.75rem' }}>
            <div className="admin-actions-list">
              <Link to="/admin/users" className="admin-action-tile">
                <div className="tile-icon-box">
                  <Users size={20} />
                </div>
                <div className="tile-info">
                  <strong>User Directory & Access</strong>
                  <span>Manage accounts, view synthetic identities, suspend access</span>
                </div>
                <ArrowRight size={16} />
              </Link>

              <Link to="/admin/accounts" className="admin-action-tile">
                <div className="tile-icon-box">
                  <Wallet size={20} />
                </div>
                <div className="tile-info">
                  <strong>Account Status Management</strong>
                  <span>Freeze suspicious accounts, inspect balances</span>
                </div>
                <ArrowRight size={16} />
              </Link>

              <Link to="/admin/ledger" className="admin-action-tile">
                <div className="tile-icon-box">
                  <BookOpen size={20} />
                </div>
                <div className="tile-info">
                  <strong>Double-Entry Ledger Audit</strong>
                  <span>Verify mathematical balance invariance and append-only log</span>
                </div>
                <ArrowRight size={16} />
              </Link>

              <Link to="/admin/limits" className="admin-action-tile">
                <div className="tile-icon-box">
                  <Sliders size={20} />
                </div>
                <div className="tile-info">
                  <strong>Transfer Limit Policies</strong>
                  <span>Configure daily & per-transaction ceilings by tier</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
