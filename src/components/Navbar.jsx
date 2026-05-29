// frontend/src/components/Navbar.jsx
// Navigation bar component shown at the top of every page

import React from 'react';

function Navbar({ currentPage, setCurrentPage }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <h1 onClick={() => setCurrentPage('home')}>
            📚 PASC
          </h1>
          <p>Personal AI Study Companion</p>
        </div>

        {/* Navigation Links */}
        <ul className="navbar-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'study' ? 'active' : ''}`}
              onClick={() => setCurrentPage('study')}
            >
              Study Materials
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'quiz' ? 'active' : ''}`}
              onClick={() => setCurrentPage('quiz')}
            >
              Quiz
            </button>
          </li>
          <li>
            <button className="nav-link login-btn">Login</button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
