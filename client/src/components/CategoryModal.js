import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';
import './CategoryModal.css';

const validationSchema = Yup.object({
  name: Yup.string().required('Category name is required'),
  description: Yup.string()
});

function CategoryModal({ category, onClose }) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!category;

  const formik = useFormik({
    initialValues: {
      name: category?.name || '',
      description: category?.description || '',
      isActive: category?.isActive !== undefined ? category.isActive : true
    },
    validationSchema,
    onSubmit: handleSubmit
  });

  async function handleSubmit(values) {
    setLoading(true);
    try {
      const url = isEditing ? `/admin/categories/${category._id}` : '/admin/categories';
      const method = isEditing ? 'put' : 'post';
      
      const response = await api[method](url, values);

      if (response.data.success) {
        toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
        onClose();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="category-modal-overlay" onClick={onClose}>
      <div className="category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="modal-form">
          <div className="modal-content">
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                name="name"
                className={`form-input ${formik.touched.name && formik.errors.name ? 'error' : ''}`}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter category name"
              />
              {formik.touched.name && formik.errors.name && (
                <div className="form-error">{formik.errors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-textarea"
                rows="4"
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Enter category description"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                />
                <span>Active Category</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;