import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import DemoInfoPage from './pages/DemoInfoPage';

// Customer Pages
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import AccountDetailsPage from './pages/AccountDetailsPage';
import TransferPage from './pages/TransferPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import BeneficiariesPage from './pages/BeneficiariesPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SupportTicketsPage from './pages/SupportTicketsPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AccountManagementPage from './pages/AccountManagementPage';
import TransactionMonitoringPage from './pages/TransactionMonitoringPage';
import TransactionLedgerPage from './pages/TransactionLedgerPage';
import AuditLogsPage from './pages/AuditLogsPage';
import TransferLimitsPage from './pages/TransferLimitsPage';
import SupportTicketsAdminPage from './pages/SupportTicketsAdminPage';
import AnnouncementManagementPage from './pages/AnnouncementManagementPage';
import SystemHealthPage from './pages/SystemHealthPage';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo-info" element={<DemoInfoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Customer Protected Pages */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/:id" element={<AccountDetailsPage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/transactions" element={<TransactionHistoryPage />} />
        <Route path="/beneficiaries" element={<BeneficiariesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<SupportTicketsPage />} />
      </Route>

      {/* Admin Protected Pages */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="accounts" element={<AccountManagementPage />} />
        <Route path="transactions" element={<TransactionMonitoringPage />} />
        <Route path="ledger" element={<TransactionLedgerPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="limits" element={<TransferLimitsPage />} />
        <Route path="tickets" element={<SupportTicketsAdminPage />} />
        <Route path="announcements" element={<AnnouncementManagementPage />} />
        <Route path="health" element={<SystemHealthPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
