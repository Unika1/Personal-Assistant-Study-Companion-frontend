import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// This page lets the user create a new account.
function SignupPage() {
  // These states store the form values.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // This runs when the signup form is submitted.
  const handleSignup = async (event) => {
    event.preventDefault();

    // Clear old messages before sending a new request.
    setError('');
    setSuccess('');

    // Make sure the passwords match before calling the backend.
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // If the user clicks Signup on a blank form, show one clear message.
    if (
      !String(firstName).trim() &&
      !String(lastName).trim() &&
      !String(email).trim() &&
      !String(password).trim() &&
      !String(confirmPassword).trim()
    ) {
      setError('Please fill all the form fields.');
      return;
    }

    // Check each field directly so the code stays simple.
    if (!firstName || !String(firstName).trim()) {
      setError('Please provide first name.');
      return;
    }

    if (!lastName || !String(lastName).trim()) {
      setError('Please provide last name.');
      return;
    }

    if (!email || !String(email).trim()) {
      setError('Please provide email.');
      return;
    }

    if (!password || !String(password).trim()) {
      setError('Please provide password.');
      return;
    }

    // The backend currently expects a name field.
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      // Send signup data to the backend.
      await axios.post('http://localhost:5000/api/auth/signup', {
        name: fullName,
        firstName,
        lastName,
        email,
        password,
      }, {
        withCredentials: true, // Send cookies with request
      });

      // Show a success message.
      setSuccess('Signup successful. Redirecting to login...');

      // After a short delay, send the user to the login page.
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err) {
      const getPlainError = (e) => {
        try {
          if (typeof navigator !== 'undefined' && !navigator.onLine) return 'No internet connection — check your network.';
        } catch (_) {}

        if (e?.message === 'Network Error' || (e && e.request && !e.response)) {
          return 'Cannot reach backend at http://localhost:5000 — is the backend server running? (Possible CORS or server error)';
        }

        if (e?.response?.data?.message) return String(e.response.data.message);

        const payload = e?.response?.data;
        if (typeof payload === 'string') {
          const text = payload.replace(/<[^>]*>/g, '').trim();
          if (text) return text;
        }

        return e?.message || 'Request failed';
      };

      setError(getPlainError(err));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>PASC </div>
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>Your Personal AI Study Companion</p>
        </div>

        {/* Show error message if signup fails */}
        {error && <p style={{ ...styles.message, ...styles.error }}>{error}</p>}

        {/* Show success message if signup works */}
        {success && <p style={{ ...styles.message, ...styles.success }}>{success}</p>}

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label htmlFor="firstName" style={styles.label}>First Name</label>
              <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="auth-input" style={styles.input} />
            </div>

            <div style={styles.field}>
              <label htmlFor="lastName" style={styles.label}>Last Name</label>
              <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="auth-input" style={styles.input} />
            </div>
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" style={styles.input} />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" style={styles.input} />
          </div>

          <div style={styles.field}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="auth-input" style={styles.input} />
          </div>

          <button type="submit" className="auth-button primary" style={styles.button}>Signup</button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.footerLink}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 96px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    background: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '620px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 24px 80px rgba(14, 23, 42, 0.18)',
  },
  header: { textAlign: 'center', marginBottom: '18px' },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)',
    color: '#ffffff',
    fontWeight: 800,
    marginBottom: '12px',
  },
  title: { margin: 0, fontSize: '1.6rem', color: '#111827' },
  subtitle: { marginTop: '8px', color: '#6b7280' },
  message: { marginBottom: '12px', padding: '12px', borderRadius: '12px', fontWeight: 700 },
  error: { background: '#fff1f1', color: '#b42318', border: '1px solid #fecaca' },
  success: { background: '#ecfdf3', color: '#047857', border: '1px solid #bbf7d0' },
  form: { display: 'grid', gap: '14px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.92rem', fontWeight: 700, color: '#374151' },
  input: { padding: '12px 14px', borderRadius: '12px', border: '1px solid #e6e6fa', background: '#fafafa' },
  button: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)', color: '#fff', fontWeight: 800, boxShadow: '0 12px 30px rgba(108,63,197,0.18)' },
  footerText: { marginTop: '14px', textAlign: 'center', color: '#6b7280' },
  footerLink: { color: '#6C3FC5', fontWeight: 800 },
};

export default SignupPage;
