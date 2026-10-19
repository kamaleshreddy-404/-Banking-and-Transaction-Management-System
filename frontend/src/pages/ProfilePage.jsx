import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Badge from '../components/common/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  KeyRound 
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserState } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Profile Edit state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
      setAddressLine(data.addressLine || '');
      setCity(data.city || '');
      setState(data.state || '');
      setPostalCode(data.postalCode || '');
    } catch (err) {
      setProfileError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileError('');
      setProfileSuccess('');

      const updated = await authService.updateProfile({
        fullName,
        phone,
        addressLine,
        city,
        state,
        postalCode
      });

      setProfile(updated);
      updateUserState({ fullName: updated.fullName });
      setProfileSuccess('Profile details successfully updated in MySQL!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.changePassword(oldPassword, newPassword);
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading && !profile) {
    return <div className="dashboard-content"><p>Loading profile...</p></div>;
  }

  return (
    <div className="dashboard-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-heading">User Profile & Security Settings</h1>
          <p className="page-subheading">
            Manage your personal simulated contact details and security credentials
          </p>
        </div>
      </div>

      {/* Account Overview Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div className="avatar-placeholder" style={{ width: 64, height: 64, fontSize: '1.75rem' }}>
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0' }}>{profile?.fullName}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                {profile?.email}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-primary">{profile?.roles?.join(', ') || 'CUSTOMER'}</span>
                <Badge status={profile?.accountStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Profile Info Form */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} />
              <strong style={{ fontSize: '1.05rem' }}>Personal Information</strong>
            </div>
          </div>

          <div className="card-body">
            {profileError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} /> {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={16} /> {profileSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={profile?.email || ''}
                  disabled
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Email identifier is immutable in demo environment.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Contact Number</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addressLine">Address</label>
                <input
                  id="addressLine"
                  type="text"
                  className="form-control"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Street address or apartment"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="state">State</label>
                  <input
                    id="state"
                    type="text"
                    className="form-control"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={savingProfile}
              >
                {savingProfile ? 'Updating Database...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} />
              <strong style={{ fontSize: '1.05rem' }}>Change Password</strong>
            </div>
          </div>

          <div className="card-body">
            {passwordError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} /> {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={16} /> {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="oldPassword">Current Password</label>
                <input
                  id="oldPassword"
                  type="password"
                  className="form-control"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-control"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
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

              <button
                type="submit"
                className="btn btn-outline-primary btn-block"
                disabled={savingPassword}
              >
                {savingPassword ? 'Hashing with BCrypt...' : 'Update Password'}
              </button>
            </form>

            <div className="demo-notice-tag" style={{ marginTop: '1.5rem' }}>
              <ShieldCheck size={14} /> Passwords in FinCore are encrypted with salted BCrypt rounds before persistence in MySQL.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
