import { useState, useEffect } from 'react';
import { userAPI, roleAPI, activityAPI } from '../../services/api';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleId: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        userAPI.getAllUsers(),
        roleAPI.getAllRoles()
      ]);
      setUsers(usersResponse.data || []);
      setRoles(rolesResponse.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.createUser(formData);
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateUser(selectedUser.id, formData);
      setShowEditModal(false);
      resetForm();
      setSelectedUser(null);
      loadData();
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      await userAPI.deleteUser(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const handleViewActivities = async (user) => {
    setSelectedUser(user);
    setShowActivityModal(true);
    try {
      const response = await activityAPI.getUserActivities(user.id);
      setUserActivities(response.data?.content || []);
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      phoneNumber: user.phoneNumber,
      roleId: user.roleId,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      roleId: '',
    });
  };

  if (loading) {
    return <div className="loading-state">Loading users...</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-new">
          + New User
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{users.filter(u => u.active).length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{users.filter(u => u.roleName === 'SUPER_ADMIN').length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{users.filter(u => u.emailVerified).length}</div>
          <div className="stat-label">Verified</div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <strong>{user.firstName} {user.lastName}</strong>
                </td>
                <td>{user.email}</td>
                <td className="text-muted">{user.phoneNumber}</td>
                <td>
                  <span className="badge badge-category">{user.roleName}</span>
                </td>
                <td>
                  {user.active ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-warning">Inactive</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => openEditModal(user)} className="action-btn btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleViewActivities(user)} className="action-btn btn-info">
                      Activity
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className={`action-btn btn-delete ${deleteConfirm === user.id ? 'confirm' : ''}`}
                    >
                      {deleteConfirm === user.id ? 'Confirm?' : 'Delete'}
                    </button>
                    {deleteConfirm === user.id && (
                      <button onClick={() => setDeleteConfirm(null)} className="action-btn btn-cancel">
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New User</h2>
              <button onClick={() => setShowCreateModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
              <div className="form-field">
                <label>Role</label>
                <select name="roleId" value={formData.roleId} onChange={handleChange} required>
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="action-btn btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-new">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleUpdateUser} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                />
              </div>
              <div className="form-field">
                <label>Role</label>
                <select name="roleId" value={formData.roleId} onChange={handleChange} required>
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="action-btn btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-new">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Activity - {selectedUser?.firstName} {selectedUser?.lastName}</h2>
              <button onClick={() => setShowActivityModal(false)} className="modal-close">&times;</button>
            </div>
            <div className="activity-list">
              {userActivities.length === 0 ? (
                <p className="empty-state-text">No activities recorded yet.</p>
              ) : (
                userActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">{getActivityIcon(activity.action)}</div>
                    <div className="activity-details">
                      <div className="activity-action">{activity.action}</div>
                      <div className="activity-meta">
                        <span>{activity.entityType}</span>
                        {activity.details && <span> - {activity.details}</span>}
                      </div>
                      <div className="activity-time">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getActivityIcon(action) {
  const icons = {
    LOGIN: '🔑',
    LOGOUT: '🚪',
    REGISTER: '✨',
    CREATE_BLOG: '📝',
    UPDATE_BLOG: '✏️',
    DELETE_BLOG: '🗑️',
    CREATE_USER: '👤',
    UPDATE_USER: '✏️',
    DELETE_USER: '🗑️',
  };
  return icons[action] || '📋';
}

export default UserManagement;
