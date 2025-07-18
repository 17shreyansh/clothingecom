import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  subject: Yup.string().required('Subject is required'),
  message: Yup.string().required('Message is required')
});

function Contact() {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await api.post('/users/contact', values);
        if (response.data.success) {
          toast.success(response.data.message);
          resetForm();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send message');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Contact Us</h1>
        
        <div className="card">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${formik.touched.name && formik.errors.name ? 'error' : ''}`}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="form-error">{formik.errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="form-error">{formik.errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  className={`form-input ${formik.touched.subject && formik.errors.subject ? 'error' : ''}`}
                  value={formik.values.subject}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.subject && formik.errors.subject && (
                  <div className="form-error">{formik.errors.subject}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  className={`form-textarea ${formik.touched.message && formik.errors.message ? 'error' : ''}`}
                  rows="5"
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                ></textarea>
                {formik.touched.message && formik.errors.message && (
                  <div className="form-error">{formik.errors.message}</div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? <div className="loading"></div> : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;