import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';
import './DiscountModal.css';

const validationSchema = Yup.object({
  code: Yup.string().required('Discount code is required').min(3, 'Code must be at least 3 characters'),
  type: Yup.string().required('Discount type is required'),
  value: Yup.number().required('Discount value is required').min(1, 'Value must be greater than 0'),
  minimumOrderAmount: Yup.number().required('Minimum order amount is required').min(0),
  maxUses: Yup.number().min(1, 'Max uses must be at least 1'),
  expiryDate: Yup.date().required('Expiry date is required').min(new Date(), 'Expiry date must be in the future')
});

function DiscountModal({ discount, onClose }) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!discount;

  const formik = useFormik({
    initialValues: {
      code: discount?.code || '',
      type: discount?.type || 'percentage',
      value: discount?.value || '',
      minimumOrderAmount: discount?.minimumOrderAmount || 0,
      maxUses: discount?.usageLimit || discount?.maxUses || '',
      expiryDate: discount?.validUntil ? new Date(discount.validUntil).toISOString().split('T')[0] : 
                  discount?.expiryDate ? new Date(discount.expiryDate).toISOString().split('T')[0] : '',
      isActive: discount?.isActive !== undefined ? discount.isActive : true
    },
    validationSchema,
    onSubmit: handleSubmit
  });

  async function handleSubmit(values) {
    setLoading(true);
    try {
      const url = isEditing ? `/admin/discounts/${discount._id}` : '/admin/discounts';
      const method = isEditing ? 'put' : 'post';
      
      const response = await api[method](url, values);

      if (response.data.success) {
        toast.success(`Discount code ${isEditing ? 'updated' : 'created'} successfully`);
        onClose();
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error(error.response?.data?.message || 'Failed to save discount code');
    } finally {
      setLoading(false);
    }
  }

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    formik.setFieldValue('code', code);
  };

  return (
    <div className="discount-modal-overlay" onClick={onClose}>
      <div className="discount-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Discount Code' : 'Add New Discount Code'}</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="modal-form">
          <div className="modal-content">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Discount Code *</label>
                <div className="code-input-group">
                  <input
                    type="text"
                    name="code"
                    className={`form-input ${formik.touched.code && formik.errors.code ? 'error' : ''}`}
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter discount code"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button type="button" onClick={generateCode} className="btn btn-outline btn-sm">
                    Generate
                  </button>
                </div>
                {formik.touched.code && formik.errors.code && (
                  <div className="form-error">{formik.errors.code}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Discount Type *</label>
                <select
                  name="type"
                  className={`form-select ${formik.touched.type && formik.errors.type ? 'error' : ''}`}
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                {formik.touched.type && formik.errors.type && (
                  <div className="form-error">{formik.errors.type}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Discount Value * {formik.values.type === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  name="value"
                  className={`form-input ${formik.touched.value && formik.errors.value ? 'error' : ''}`}
                  value={formik.values.value}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={formik.values.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                  min="1"
                  max={formik.values.type === 'percentage' ? '100' : undefined}
                />
                {formik.touched.value && formik.errors.value && (
                  <div className="form-error">{formik.errors.value}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Order Amount (₹) *</label>
                <input
                  type="number"
                  name="minimumOrderAmount"
                  className={`form-input ${formik.touched.minimumOrderAmount && formik.errors.minimumOrderAmount ? 'error' : ''}`}
                  value={formik.values.minimumOrderAmount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter minimum order amount"
                  min="0"
                />
                {formik.touched.minimumOrderAmount && formik.errors.minimumOrderAmount && (
                  <div className="form-error">{formik.errors.minimumOrderAmount}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Maximum Uses</label>
                <input
                  type="number"
                  name="maxUses"
                  className="form-input"
                  value={formik.values.maxUses}
                  onChange={formik.handleChange}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input
                  type="date"
                  name="expiryDate"
                  className={`form-input ${formik.touched.expiryDate && formik.errors.expiryDate ? 'error' : ''}`}
                  value={formik.values.expiryDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formik.touched.expiryDate && formik.errors.expiryDate && (
                  <div className="form-error">{formik.errors.expiryDate}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                />
                <span>Active Discount Code</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : (isEditing ? 'Update Discount' : 'Create Discount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DiscountModal;