import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Auth.css';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

function Login() {
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const result = await login(values.email, values.password);
        if (result.success) {
          toast.success(result.message || 'Login successful');
          navigate(from, { replace: true });
        } else {
          toast.error(result.message || 'Login failed');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }
  });

  const resetFormik = useFormik({
    initialValues: {
      email: '',
      currentPassword: '',
      newPassword: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required')
    }),
    onSubmit: async (values) => {
      setResetLoading(true);
      try {
        const response = await api.post('/auth/reset-password', values);
        if (response.data.success) {
          toast.success('Password reset successfully');
          setShowForgotPassword(false);
          resetFormik.resetForm();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Password reset failed');
      } finally {
        setResetLoading(false);
      }
    }
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="form-error">{formik.errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${formik.touched.password && formik.errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="form-error">{formik.errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <div className="loading"></div> : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <button 
            type="button" 
            className="forgot-password-btn"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reset Password</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowForgotPassword(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={resetFormik.handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${resetFormik.touched.email && resetFormik.errors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    value={resetFormik.values.email}
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                  />
                  {resetFormik.touched.email && resetFormik.errors.email && (
                    <div className="form-error">{resetFormik.errors.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className={`form-input ${resetFormik.touched.currentPassword && resetFormik.errors.currentPassword ? 'error' : ''}`}
                    placeholder="Enter your current password"
                    value={resetFormik.values.currentPassword}
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                  />
                  {resetFormik.touched.currentPassword && resetFormik.errors.currentPassword && (
                    <div className="form-error">{resetFormik.errors.currentPassword}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className={`form-input ${resetFormik.touched.newPassword && resetFormik.errors.newPassword ? 'error' : ''}`}
                    placeholder="Enter your new password"
                    value={resetFormik.values.newPassword}
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                  />
                  {resetFormik.touched.newPassword && resetFormik.errors.newPassword && (
                    <div className="form-error">{resetFormik.errors.newPassword}</div>
                  )}
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={resetLoading}
                  >
                    {resetLoading ? <div className="loading"></div> : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;