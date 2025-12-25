import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookmarkAPI } from '../../services/api';
import '../../styles/design-system.css';
import './UserProfile.css';

function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookmarks');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBookmarks();
  }, [user, navigate]);

  const loadBookmarks = async () => {
    try {
      const response = await bookmarkAPI.getUserBookmarks(user.id);
      setBookmarks(response.data?.content || []);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId) => {
    try {
      await bookmarkAPI.removeBookmark(postId, user.id);
      setBookmarks(bookmarks.filter(post => post.id !== postId));
    } catch (error) {
      alert('Failed to remove bookmark');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      {/* Header Section */}
      <div className="profile-header gradient-bg">
        <div className="container">
          <div className="profile-header-content">
            <div className="profile-avatar">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="profile-info">
              <h1>{user.firstName} {user.lastName}</h1>
              <p>{user.email}</p>
              <div className="profile-badges">
                <span className="badge badge-primary">{user.role || 'USER'}</span>
                {bookmarks.length > 0 && (
                  <span className="badge badge-success">{bookmarks.length} Saved Posts</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container" style={{ marginTop: 'var(--spacing-xl)' }}>
        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            📚 Saved Posts ({bookmarks.length})
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'bookmarks' && (
          <div className="tab-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your saved posts...</p>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3>No Saved Posts Yet</h3>
                <p>Start exploring and save posts you'd like to read later</p>
                <Link to="/blog" className="btn btn-primary">
                  Browse Blog Posts
                </Link>
              </div>
            ) : (
              <div className="bookmarks-grid">
                {bookmarks.map((post) => (
                  <div key={post.id} className="card bookmark-card">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt={post.title} className="bookmark-image" />
                    )}
                    <div className="bookmark-content">
                      <div className="bookmark-header">
                        <span className="badge badge-primary">{post.category}</span>
                        <button
                          onClick={() => handleRemoveBookmark(post.id)}
                          className="btn-icon btn-secondary"
                          title="Remove bookmark"
                        >
                          ❌
                        </button>
                      </div>
                      <h3>{post.title}</h3>
                      <p className="bookmark-summary">{post.summary}</p>
                      <Link to={`/blog/${post.id}`} className="btn btn-primary">
                        Read Article
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
              <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Account Settings</h2>

              <div className="settings-section">
                <h3>Profile Information</h3>
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{user.firstName} {user.lastName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role:</span>
                  <span className="info-value">{user.role || 'USER'}</span>
                </div>
              </div>

              <div className="settings-section">
                <h3>Account Actions</h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                  <Link to="/forgot-password" className="btn btn-outline">
                    Change Password
                  </Link>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
