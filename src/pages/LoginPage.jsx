import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        {/* Show error message if login fails */}
        {error && <p className="auth-message auth-error">{error}</p>}

        {/* Show success message if login works */}
        {success && <p className="auth-message auth-success">{success}</p>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
