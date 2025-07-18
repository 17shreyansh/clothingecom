import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit3, FiTrash2, FiMoreVertical, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { search: searchTerm, role: selectedRole };
      const response = await api.get('/admin/users', { params });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
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
                  
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <span className="date-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="actions-cell">
                    <div className="actions-dropdown">
                      <button className="actions-trigger">
                        <FiMoreVertical />
                      </button>
                      <div className="actions-menu">
                        <button>
                          <FiEdit3 />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="delete-action"
                          disabled={user.role === 'admin'}
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
      </div>
    </AdminLayout>
  );
}

export default Users;