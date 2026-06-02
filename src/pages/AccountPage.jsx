import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';

// AccountPage shows the student's profile in a clean card layout.
function AccountPage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    institution: '',
    degree: '',
    totalSessions: 0,
    totalQuestions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    institution: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load the student's profile when the page opens.
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get('/users/profile');
        const data = response.data?.data || response.data?.user || response.data;

        const nextProfile = {
          name: data?.name || '',
          email: data?.email || '',
          institution: data?.institution || '',
          degree: data?.degree || '',
          totalSessions: data?.totalSessions || 0,
          totalQuestions: data?.totalQuestions || 0,
        };

        setProfile(nextProfile);
        setEditForm({
          name: nextProfile.name,
          institution: nextProfile.institution,
        });
      } catch (err) {
        const fallbackMessage = err?.response?.data?.message || 'Could not load profile.';
        setError(fallbackMessage);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Start editing with the current name and institution.
  const handleStartEdit = () => {
    setEditForm({
      name: profile.name,
      institution: profile.institution,
    });
    setIsEditing(true);
    setMessage('');
  };

  // Save the updated name and institution.
  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const response = await apiClient.put('/users/profile', {
        name: editForm.name,
        institution: editForm.institution,
      });

      const updatedProfile = response.data?.data || response.data?.user || response.data;

      setProfile((prev) => ({
        ...prev,
        name: updatedProfile?.name || editForm.name,
        institution: updatedProfile?.institution || editForm.institution,
      }));

      setIsEditing(false);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Save the new password.
  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Please fill all password fields.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');

      await apiClient.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
      setMessage('Password changed successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not change password.');
    } finally {
      setSaving(false);
    }
  };

  const firstLetter = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'P';

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow} />
      <div style={styles.container}>
        <div style={styles.headerCard}>
          <div style={styles.avatar}>{firstLetter}</div>
          <div>
            <h1 style={styles.title}>My Account</h1>
            <p style={styles.subtitle}>View and manage your PASC profile</p>
          </div>
        </div>

        {loading && <p style={styles.infoText}>Loading your profile...</p>}
        {error && <p style={{ ...styles.alert, ...styles.error }}>{error}</p>}
        {message && <p style={{ ...styles.alert, ...styles.success }}>{message}</p>}

        {!loading && (
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Profile Details</h2>
                {!isEditing ? (
                  <button type="button" style={styles.secondaryButton} onClick={handleStartEdit}>
                    Edit
                  </button>
                ) : null}
              </div>

              {!isEditing ? (
                <div style={styles.detailList}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Name</span>
                    <span style={styles.detailValue}>{profile.name || 'Not added yet'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Email</span>
                    <span style={styles.detailValue}>{profile.email || 'Not added yet'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Institution</span>
                    <span style={styles.detailValue}>{profile.institution || 'Not added yet'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Degree</span>
                    <span style={styles.detailValue}>{profile.degree || 'Not added yet'}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={styles.form}>
                  <div style={styles.field}>
                    <label htmlFor="name" style={styles.label}>Name</label>
                    <input
                      id="name"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label htmlFor="institution" style={styles.label}>Institution</label>
                    <input
                      id="institution"
                      type="text"
                      value={editForm.institution}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, institution: e.target.value }))}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.actionRow}>
                    <button type="button" style={styles.cancelButton} onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                    <button type="submit" style={styles.primaryButton} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{profile.totalSessions}</div>
                <div style={styles.statLabel}>Total Sessions</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{profile.totalQuestions}</div>
                <div style={styles.statLabel}>Questions Asked</div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Security</h2>
                {!isChangingPassword ? (
                  <button type="button" style={styles.secondaryButton} onClick={() => setIsChangingPassword(true)}>
                    Change Password
                  </button>
                ) : null}
              </div>

              {!isChangingPassword ? (
                <p style={styles.infoText}>
                  You can update your password anytime to keep your account secure.
                </p>
              ) : (
                <form onSubmit={handleChangePassword} style={styles.form}>
                  <div style={styles.field}>
                    <label htmlFor="currentPassword" style={styles.label}>Current Password</label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label htmlFor="newPassword" style={styles.label}>New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label htmlFor="confirmPassword" style={styles.label}>Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.actionRow}>
                    <button type="button" style={styles.cancelButton} onClick={() => setIsChangingPassword(false)}>
                      Cancel
                    </button>
                    <button type="submit" style={styles.primaryButton} disabled={saving}>
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f5ff 0%, #eef2ff 100%)',
    padding: '32px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    top: '-120px',
    right: '-80px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'rgba(108, 63, 197, 0.12)',
    filter: 'blur(40px)',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '980px',
    margin: '0 auto',
    display: 'grid',
    gap: '20px',
  },
  headerCard: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 16px 40px rgba(16, 24, 40, 0.08)',
    border: '1px solid rgba(108, 63, 197, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 800,
    boxShadow: '0 12px 28px rgba(108, 63, 197, 0.25)',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    color: '#111827',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#6b7280',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 16px 40px rgba(16, 24, 40, 0.08)',
    border: '1px solid rgba(108, 63, 197, 0.08)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '18px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#111827',
  },
  secondaryButton: {
    border: '1px solid rgba(108, 63, 197, 0.18)',
    background: '#f8f5ff',
    color: '#6C3FC5',
    padding: '10px 14px',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  primaryButton: {
    border: 'none',
    background: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)',
    color: '#ffffff',
    padding: '10px 14px',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(108, 63, 197, 0.2)',
  },
  cancelButton: {
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#374151',
    padding: '10px 14px',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  detailList: {
    display: 'grid',
    gap: '14px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '14px 16px',
    borderRadius: '16px',
    background: '#f8fafc',
    border: '1px solid #eef2ff',
  },
  detailLabel: {
    color: '#6b7280',
    fontWeight: 700,
  },
  detailValue: {
    color: '#111827',
    fontWeight: 700,
    textAlign: 'right',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '20px',
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 16px 40px rgba(16, 24, 40, 0.08)',
    border: '1px solid rgba(108, 63, 197, 0.08)',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#6C3FC5',
  },
  statLabel: {
    marginTop: '6px',
    color: '#6b7280',
    fontWeight: 700,
  },
  form: {
    display: 'grid',
    gap: '14px',
  },
  field: {
    display: 'grid',
    gap: '8px',
  },
  label: {
    color: '#374151',
    fontWeight: 700,
  },
  input: {
    width: '100%',
    border: '1px solid #e5e7eb',
    background: '#fafafa',
    borderRadius: '14px',
    padding: '12px 14px',
    fontSize: '0.98rem',
    outline: 'none',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '4px',
  },
  alert: {
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 700,
  },
  error: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  },
  success: {
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #bbf7d0',
  },
  infoText: {
    color: '#6b7280',
    lineHeight: 1.7,
    margin: 0,
  },
};

export default AccountPage;
