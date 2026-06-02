import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import '../styles/App.css';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';

// This small header component decides which links to show based on login state.
function AppHeader() {
  // Get the navigate function so we can move to the login page after logout.
  const navigate = useNavigate();

  // Read the token from localStorage.
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  // Remove the token and send the user back to the login page.
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="nav-left">
        <div className="app-logo">PASC</div>
      </div>

      <nav className="app-nav" aria-label="Primary">
        <div className="nav-center">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>

          <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Chat
          </NavLink>

          {/* Only show Login and Signup when the user is not logged in. */}
          {!isLoggedIn && (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Login
              </NavLink>

              <NavLink to="/signup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Signup
              </NavLink>
            </>
          )}
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <>
              <span className="user-name">{localStorage.getItem('name') || 'Account'}</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

// This app starts with only login and signup.
function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppHeader />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
