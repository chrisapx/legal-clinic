import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⚖️</span>
          Legal Clinic Uganda
        </Link>

        <div className="nav-menu">
          <Link
            to="/"
            className={`nav-link ${isActive('/') && !location.pathname.includes('blog') && !location.pathname.includes('admin') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/blog"
            className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
          >
            Blog
          </Link>
          <Link
            to="/admin/blog"
            className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
