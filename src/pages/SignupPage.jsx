import React, { useState } from 'react';
import axios from 'axios';

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
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-header">
          <div className="signup-logo">PASC</div>
          <h2 className="signup-title">Create your account</h2>
          <p className="signup-subtitle">Join PASC and start your study journey.</p>
        </div>

        {/* Show error message if signup fails */}
        {error && <p className="auth-message auth-error">{error}</p>}

        {/* Show success message if signup works */}
        {success && <p className="auth-message auth-success">{success}</p>}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="signup-name-row">
            <div className="auth-field">
              <label htmlFor="firstName">First Name</label>
              <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="auth-input" />
            </div>

            <div className="auth-field">
              <label htmlFor="lastName">Last Name</label>
              <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="auth-input" />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="auth-input" />
          </div>

          <button type="submit" className="auth-button primary">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
