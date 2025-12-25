import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/design-system.css';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const isAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/blog" className="navbar-logo">
          ⚖️ <span className="gradient-text">LegalConnect</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Nav Links */}
        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/blog"
            className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            📚 Articles
          </Link>

          <Link
            to="/chat"
            className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            💬 Legal Chat
          </Link>

          {/* Admin-only link */}
          {isAdmin && (
            <Link
              to="/admin"
              className="nav-link admin-link"
              onClick={() => setMenuOpen(false)}
            >
              🛡️ Admin Panel
            </Link>
          )}

          <div className="navbar-divider"></div>

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              <Link
                to="/profile"
                className="user-menu-button"
                onClick={() => setMenuOpen(false)}
              >
                <div className="user-avatar">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <span className="user-name">{user.firstName}</span>
              </Link>

              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  👤 Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    🛡️ Admin Panel
                  </Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="dropdown-item">
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link
                to="/login"
                className="btn btn-secondary"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
