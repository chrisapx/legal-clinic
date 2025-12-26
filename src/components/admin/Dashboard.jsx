import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, blogAPI, conversationAPI, activityAPI } from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalConversations: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, postsRes, conversationsRes, activitiesRes] = await Promise.allSettled([
        userAPI.getAllUsers(),
        blogAPI.getAllPosts(),
        conversationAPI.getUserConversations(user?.id || 0, false, 0, 100),
        activityAPI.getAllActivities(0, 10)
      ]);

      setStats({
        totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data?.length || 0 : 0,
        totalPosts: postsRes.status === 'fulfilled' ? postsRes.value.data?.length || 0 : 0,
        totalConversations: conversationsRes.status === 'fulfilled' ?
          conversationsRes.value.data?.content?.length || 0 : 0,
        recentActivities: activitiesRes.status === 'fulfilled' ?
          activitiesRes.value.data?.content?.slice(0, 5) || [] : []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'primary',
      link: '/admin/users'
    },
    {
      title: 'Blog Posts',
      value: stats.totalPosts,
      icon: '📝',
      color: 'accent',
      link: '/admin/blog'
    },
    {
      title: 'Conversations',
      value: stats.totalConversations,
      icon: '💬',
      color: 'success',
      link: '/admin'
    },
    {
      title: 'Questions',
      value: '0',
      icon: '❓',
      color: 'warning',
      link: '/admin/questions'
    }
  ];

  const quickActions = [
    { label: 'Create Blog Post', icon: '➕', link: '/admin/blog/new', color: 'primary' },
    { label: 'Manage Users', icon: '👥', link: '/admin/users', color: 'accent' },
    { label: 'View Documents', icon: '📄', link: '/admin/documents', color: 'success' },
    { label: 'Q&A Forum', icon: '💬', link: '/admin/questions', color: 'warning' }
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="gradient-text">
            Welcome back, {user?.firstName || 'Admin'}!
          </h1>
          <p className="welcome-subtitle">
            Here's what's happening with your platform today.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/admin/blog/new" className="btn btn-primary">
            <span>➕</span>
            New Post
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className={`stat-card stat-card-${stat.color}`}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
            <div className="stat-arrow">→</div>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`quick-action-card quick-action-${action.color}`}
              >
                <div className="action-icon">{action.icon}</div>
                <span className="action-label">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <Link to="/admin" className="view-all-link">View All →</Link>
          </div>
          <div className="activity-list">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">📌</div>
                  <div className="activity-content">
                    <p className="activity-description">
                      {activity.activityType || 'Activity'} by {activity.userId || 'User'}
                    </p>
                    <span className="activity-time">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h3>Getting Started</h3>
            <p>Explore the admin panel to manage users, create blog posts, and handle legal documentation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
