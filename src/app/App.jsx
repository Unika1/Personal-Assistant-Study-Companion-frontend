import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../styles/App.css';
import { getLanguage, setLanguage } from '../services/api';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';
import AccountPage from '../pages/AccountPage';
import StudyMaterialPage from '../pages/StudyMaterialPage';
import QuizPage from '../pages/QuizPage';
import ProgressPage from '../pages/ProgressPage';

// This small header component decides which links to show based on login state.
function AppHeader() {
  // Get the navigate function so we can move to the login page after logout.
  const navigate = useNavigate();

  // Subscribe this header to route changes. Without this the header only reads
  // the login state once, so the Study/Quiz/Progress links would not appear
  // right after logging in (they would only show after a manual refresh).
  // Reading the location here forces the header to re-render on every
  // navigation, so it always reflects the current login state.
  useLocation();

  // Read the token from localStorage to decide if the student is logged in.
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  // The chosen reply language for PASC ('en' or 'ne'). Kept in localStorage via
  // setLanguage so every page and every AI request uses the same choice.
  const [language, setLanguageState] = useState(getLanguage());

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  };

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

          {/* Core study features are only shown to logged-in students. */}
          {isLoggedIn && (
            <>
              <NavLink to="/study" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Study
              </NavLink>

              <NavLink to="/quiz" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Quiz
              </NavLink>

              <NavLink to="/progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Progress
              </NavLink>

              <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Chat
              </NavLink>
            </>
          )}

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
          {/* Language toggle: switches PASC replies between English and Nepali.
              Shown to everyone so the choice can be made before logging in. */}
          <div className="lang-toggle" role="group" aria-label="Reply language">
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'ne' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('ne')}
            >
              नेपाली
            </button>
          </div>

          {isLoggedIn ? (
            <>
              <NavLink to="/account" className="user-name">
                {localStorage.getItem('name') || 'Account'}
              </NavLink>
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
          <Route path="/study" element={<StudyMaterialPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
