import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// This page lets the user log in with email and password.
function LoginPage() {
  // These states store the form data.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Get navigate function from react-router so we can redirect after login
  const navigate = useNavigate();

  // This runs when the form is submitted.
  const handleLogin = async (event) => {
    event.preventDefault();

    // Clear old messages before sending a new request.
    setError('');
    setSuccess('');

    try {
      // Send login data to the backend.
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      }, {
        withCredentials: true, // Send cookies with request
      });

      // Save the token in localStorage so we can use it later.
      localStorage.setItem('token', response.data.token);

      // Load the student's saved language preference from their account so the
      // choice they made on another device/browser is restored on this one.
      const savedLanguage = response.data?.user?.language;
      if (savedLanguage === 'en' || savedLanguage === 'ne') {
        localStorage.setItem('language', savedLanguage);
      }

      // Show a simple success message and redirect after a short delay.
      setSuccess('Login successful. Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      // Show a friendly error message if login fails.
      const getPlainError = (e) => {
        // Offline detection
        try {
          if (typeof navigator !== 'undefined' && !navigator.onLine) return 'No internet connection — check your network.';
        } catch (_) {}

        // Axios/network errors where no response was received
        if (e?.message === 'Network Error' || (e && e.request && !e.response)) {
          return 'Cannot reach backend at http://localhost:5000 — is the backend server running? (Possible CORS or server error)';
        }

        // Prefer structured JSON message from backend
        if (e?.response?.data?.message) return String(e.response.data.message);

        // If backend returned HTML (e.g. error page), strip tags
        const payload = e?.response?.data;
        if (typeof payload === 'string') {
          const text = payload.replace(/<[^>]*>/g, '').trim();
          if (text) return text;
        }

        // Fallback to axios message or generic text
        return e?.message || 'Request failed';
      };

      setError(getPlainError(err));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>PASC</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Your Personal AI Study Companion</p>
        </div>

        {/* Show error message if login fails */}
        {error && <p style={{ ...styles.message, ...styles.error }}>{error}</p>}

        {/* Show success message if login works */}
        {success && <p style={{ ...styles.message, ...styles.success }}>{success}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              autoComplete="email"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          <button type="submit" className="auth-button" style={styles.button}>
            Login
          </button>
        </form>

        <p style={styles.footerText}>
          Don’t have an account?{' '}
          <Link to="/signup" style={styles.footerLink}>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    minHeight: 'calc(100vh - 96px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
  },
  glowOne: {
    position: 'absolute',
    top: '-120px',
    left: '-80px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    filter: 'blur(30px)',
  },
  glowTwo: {
    position: 'absolute',
    right: '-90px',
    bottom: '-120px',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.10)',
    filter: 'blur(40px)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '460px',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '32px 30px',
    boxShadow: '0 24px 80px rgba(14, 23, 42, 0.22)',
    border: '1px solid rgba(255,255,255,0.55)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)',
    color: '#ffffff',
    fontWeight: 800,
    letterSpacing: '0.3px',
    marginBottom: '16px',
    boxShadow: '0 12px 24px rgba(108, 63, 197, 0.25)',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    color: '#111827',
    lineHeight: 1.15,
  },
  subtitle: {
    margin: '10px 0 0',
    fontSize: '0.98rem',
    color: '#6b7280',
  },
  message: {
    marginBottom: '16px',
    padding: '12px 14px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
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
  form: {
    display: 'grid',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '14px 15px',
    borderRadius: '14px',
    border: '1px solid #d6d3ff',
    outline: 'none',
    fontSize: '1rem',
    background: '#fafafa',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
  },
  button: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #6C3FC5 0%, #4A90D9 100%)',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 800,
    letterSpacing: '0.2px',
    boxShadow: '0 14px 30px rgba(108, 63, 197, 0.28)',
    cursor: 'pointer',
  },
  footerText: {
    marginTop: '18px',
    textAlign: 'center',
    fontSize: '0.95rem',
    color: '#6b7280',
  },
  footerLink: {
    color: '#6C3FC5',
    fontWeight: 800,
    textDecoration: 'none',
  },
};

export default LoginPage;
