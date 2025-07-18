import React from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>
      
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label className="form-label">Name</label>
              <p>{user?.name}</p>
            </div>
            <div>
              <label className="form-label">Email</label>
              <p>{user?.email}</p>
            </div>
            <div>
              <label className="form-label">Phone</label>
              <p>{user?.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="form-label">Role</label>
              <p>{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;