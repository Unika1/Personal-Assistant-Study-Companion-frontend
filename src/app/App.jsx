import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import '../styles/App.css';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';

// This app starts with only login and signup.
function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-branding">
            <h1 className="app-title">PASC</h1>
            <p className="app-subtitle">Personal AI Study Companion</p>
          </div>

          <nav className="app-nav" aria-label="Primary">
            <NavLink to="/" className={({ isActive }) => `app-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => `app-link ${isActive ? 'active' : ''}`}>
              Login
            </NavLink>
            <NavLink to="/signup" className={({ isActive }) => `app-link ${isActive ? 'active' : ''}`}>
              Signup
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `app-link ${isActive ? 'active' : ''}`}>
              Chat
            </NavLink>
          </nav>
        </header>

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
