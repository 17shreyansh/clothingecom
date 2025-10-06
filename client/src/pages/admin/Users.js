import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit3, FiTrash2, FiMoreVertical, FiUser, FiMail, FiCalendar, FiPlus, FiShield, FiShieldOff, FiKey, FiEye, FiUserX, FiUserCheck } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, banned: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { 
        search: searchTerm, 
        role: selectedRole,
        status: selectedStatus
      };
      const response = await api.get('/admin/users', { params });
      if (response.data.success) {
        setUsers(response.data.users);
        setStats(response.data.stats || { total: 0, active: 0, inactive: 0, banned: 0 });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      if (response.data.success) {
        toast.success('User created successfully');
        setShowCreateModal(false);
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
    }
  };

  const handleViewUser = async (user) => {
    try {
      const response = await api.get(`/admin/users/${user._id}`);
      if (response.data.success) {
        setSelectedUser(response.data.user);
        setShowUserDetailModal(true);
      }
    } catch (error) {
      toast.error('Failed to fetch user details');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await api.patch(`/admin/users/${userId}`, { role: newRole });
      if (response.data.success) {
        toast.success('User role updated successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/users/${userId}`, { isActive: !currentStatus });
      if (response.data.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
      const response = await api.patch(`/admin/users/${editingUser._id}`, userData);
      if (response.data.success) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleBanUser = (user) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleBanSubmit = async (reason) => {
    try {
      const response = await api.patch(`/admin/users/${selectedUser._id}/ban`, { reason });
      if (response.data.success) {
        toast.success('User banned successfully');
        setShowBanModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to ban user';
      toast.error(errorMessage);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/unban`);
      if (response.data.success) {
        toast.success('User unbanned successfully');
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to unban user';
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setShowPasswordResetModal(true);
  };

  const handlePasswordReset = async (newPassword) => {
    try {
      const response = await api.patch(`/admin/users/${selectedUser._id}/reset-password`, { newPassword });
      if (response.data.success) {
        toast.success('Password reset successfully');
        setShowPasswordResetModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
    }
  };

  const handleDeleteConfirm = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = async (force = false) => {
    try {
      const url = force ? `/admin/users/${userToDelete._id}?force=true` : `/admin/users/${userToDelete._id}`;
      const response = await api.delete(url);
      if (response.data.success) {
        toast.success('User deleted successfully');
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.hasOrders) {
        const confirmForce = window.confirm(
          `${errorData.message}\n\nDo you want to force delete this user? This will permanently remove the user but keep their order history.`
        );
        if (confirmForce) {
          handleDeleteUser(true);
        }
      } else {
        const errorMessage = errorData?.message || 'Failed to delete user';
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="users-admin">
        <div className="users-header">
          <div>
            <h1>Users Management</h1>
            <p>Manage user accounts and permissions</p>
          </div>
          <div className="header-actions">
            <button 
              className="create-user-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus />
              Add User
            </button>
            <div className="users-stats">
              <div className="stat-card">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.inactive}</span>
                <span className="stat-label">Inactive</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.banned}</span>
                <span className="stat-label">Banned</span>
              </div>
            </div>
          </div>
        </div>

        <div className="users-filters">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <div className="users-table-container">
          {loading ? (
            <div className="table-loading">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton table-row-skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>Status</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              
              {users.map(user => (
                <div key={user._id} className="table-row">
                  <div className="user-cell">
                    <div className="user-avatar">
                      <FiUser />
                    </div>
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.phone || 'No phone'}</p>
                    </div>
                  </div>
                  
                  <span className="email-cell">{user.email}</span>
                  
                  <div className="role-cell">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="status-badges">
                    <button 
                      className={`status-badge ${user.isBanned ? 'banned' : user.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      title={`Click to ${user.isActive ? 'deactivate' : 'activate'}`}
                      disabled={user.isBanned}
                    >
                      {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                    </button>
                    {user.isBanned && (
                      <span className="ban-indicator" title={`Banned: ${user.banReason}`}>
                        <FiShield />
                      </span>
                    )}
                  </div>
                  
                  <span className="date-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="actions-cell">
                    <div className="actions-dropdown">
                      <button className="actions-trigger">
                        <FiMoreVertical />
                      </button>
                      <div className="actions-menu">
                        <button onClick={() => handleViewUser(user)}>
                          <FiEye />
                          View Details
                        </button>
                        <button onClick={() => handleEditUser(user)}>
                          <FiEdit3 />
                          Edit
                        </button>
                        {!user.isBanned ? (
                          <button 
                            onClick={() => handleBanUser(user)}
                            className="ban-action"
                            disabled={user.role === 'admin'}
                            title={user.role === 'admin' ? 'Cannot ban admin users' : 'Ban user'}
                          >
                            <FiShield />
                            Ban
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUnbanUser(user._id)}
                            className="unban-action"
                          >
                            <FiShieldOff />
                            Unban
                          </button>
                        )}
                        <button onClick={() => handleResetPassword(user)}>
                          <FiKey />
                          Reset Password
                        </button>
                        <button 
                          onClick={() => handleDeleteConfirm(user)}
                          className="delete-action"
                          disabled={user.role === 'admin'}
                          title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Create New User</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>
              <CreateUserForm 
                onSubmit={handleCreateUser}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit User</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  ×
                </button>
              </div>
              <EditUserForm 
                user={editingUser}
                onSubmit={handleUpdateUser}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showUserDetailModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content large-modal">
              <div className="modal-header">
                <h3>User Details</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowUserDetailModal(false)}
                >
                  ×
                </button>
              </div>
              <UserDetailView 
                user={selectedUser}
                onClose={() => setShowUserDetailModal(false)}
              />
            </div>
          </div>
        )}

        {/* Ban User Modal */}
        {showBanModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Ban User</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowBanModal(false)}
                >
                  ×
                </button>
              </div>
              <BanUserForm 
                user={selectedUser}
                onSubmit={handleBanSubmit}
                onCancel={() => setShowBanModal(false)}
              />
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {showPasswordResetModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Reset Password</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowPasswordResetModal(false)}
                >
                  ×
                </button>
              </div>
              <PasswordResetForm 
                user={selectedUser}
                onSubmit={handlePasswordReset}
                onCancel={() => setShowPasswordResetModal(false)}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Confirm Delete</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete user <strong>{userToDelete.name}</strong>?</p>
                <p className="warning-text">This action cannot be undone.</p>
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowDeleteConfirm(false)} 
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDeleteUser(false)} 
                    className="delete-btn"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Create User Form Component
function CreateUserForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    isActive: true,
    emailVerified: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label>Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
      </div>
      
      <div className="form-group">
        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          Active User
        </label>
      </div>
      
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="emailVerified"
            checked={formData.emailVerified}
            onChange={handleChange}
          />
          Email Verified
        </label>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          Create User
        </button>
      </div>
    </form>
  );
}

// Edit User Form Component
function EditUserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    isActive: user.isActive,
    emailVerified: user.emailVerified || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          Active User
        </label>
      </div>
      
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="emailVerified"
            checked={formData.emailVerified}
            onChange={handleChange}
          />
          Email Verified
        </label>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          Update User
        </button>
      </div>
    </form>
  );
}

// User Detail View Component
function UserDetailView({ user, onClose }) {
  return (
    <div className="user-detail-view">
      <div className="user-detail-header">
        <div className="user-avatar-large">
          <FiUser />
        </div>
        <div className="user-basic-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className="user-badges">
            <span className={`badge ${user.role}`}>{user.role}</span>
            <span className={`badge ${user.isBanned ? 'banned' : user.isActive ? 'active' : 'inactive'}`}>
              {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
            </span>
            {user.emailVerified && <span className="badge verified">Verified</span>}
          </div>
        </div>
      </div>
      
      <div className="user-detail-content">
        <div className="detail-section">
          <h3>Contact Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Phone:</label>
              <span>{user.phone || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <label>Email Verified:</label>
              <span>{user.emailVerified ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Account Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>User ID:</label>
              <span>{user._id}</span>
            </div>
            <div className="detail-item">
              <label>Created:</label>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <label>Last Updated:</label>
              <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <label>Last Login:</label>
              <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
            </div>
            <div className="detail-item">
              <label>Total Orders:</label>
              <span>{user.orderCount || 0}</span>
            </div>
          </div>
        </div>
        
        {user.isBanned && (
          <div className="detail-section ban-info">
            <h3>Ban Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Reason:</label>
                <span>{user.banReason}</span>
              </div>
              <div className="detail-item">
                <label>Banned On:</label>
                <span>{new Date(user.bannedAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Banned By:</label>
                <span>{user.bannedBy?.name || 'System'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="form-actions">
        <button onClick={onClose} className="submit-btn">
          Close
        </button>
      </div>
    </div>
  );
}

// Ban User Form Component
function BanUserForm({ user, onSubmit, onCancel }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for banning this user');
      return;
    }
    onSubmit(reason);
  };

  return (
    <form onSubmit={handleSubmit} className="ban-user-form">
      <div className="ban-warning">
        <FiShield className="warning-icon" />
        <p>You are about to ban user <strong>{user.name}</strong>.</p>
        <p>This will deactivate their account and prevent them from logging in.</p>
      </div>
      
      <div className="form-group">
        <label>Reason for Ban *</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for banning this user..."
          rows={4}
          required
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" className="ban-btn">
          Ban User
        </button>
      </div>
    </form>
  );
}

// Password Reset Form Component
function PasswordResetForm({ user, onSubmit, onCancel }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    onSubmit(newPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="password-reset-form">
      <div className="reset-warning">
        <FiKey className="warning-icon" />
        <p>You are about to reset the password for <strong>{user.name}</strong>.</p>
        <p>The user will need to use the new password to log in.</p>
      </div>
      
      <div className="form-group">
        <label>New Password *</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      
      <div className="form-group">
        <label>Confirm Password *</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          Reset Password
        </button>
      </div>
    </form>
  );
}

export default Users;