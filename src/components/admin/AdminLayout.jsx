import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    // Exact match for dashboard
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    // For other routes, check if pathname starts with the path
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', enabled: true },
    { path: '/admin/blog', label: 'Blog Posts', icon: '📝', enabled: true },
    { path: '/admin/users', label: 'Users', icon: '👥', enabled: true },
    { path: '/admin/lawyers', label: 'Lawyers', icon: '⚖️', enabled: false },
    { path: '/admin/firms', label: 'Legal Firms', icon: '🏢', enabled: false },
    { path: '/admin/documents', label: 'Documents', icon: '📄', enabled: false },
    { path: '/admin/questions', label: 'Q&A Forum', icon: '💬', enabled: false },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">⚖️</div>
          <h2>Legal Clinic Uganda</h2>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            item.enabled ? (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ) : (
              <div
                key={item.path}
                className="nav-item disabled"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">
                  {item.label}
                  <span className="coming-soon-badge">Coming Soon</span>
                </span>
              </div>
            )
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
