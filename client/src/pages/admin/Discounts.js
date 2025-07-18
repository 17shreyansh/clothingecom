import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit3, FiTrash2, FiPercent, FiMoreVertical, FiCopy } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import DiscountModal from '../../components/DiscountModal';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Discounts.css';

function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/discounts');
      if (response.data.success) {
        setDiscounts(response.data.discounts);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setShowModal(true);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setShowModal(true);
  };

  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) return;
    
    try {
      const response = await api.delete(`/admin/discounts/${discountId}`);
      if (response.data.success) {
        toast.success('Discount code deleted successfully');
        fetchDiscounts();
      }
    } catch (error) {
      toast.error('Failed to delete discount code');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Discount code copied to clipboard');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDiscount(null);
    fetchDiscounts();
  };

  const getDiscountTypeLabel = (type) => {
    return type === 'percentage' ? 'Percentage' : 'Fixed Amount';
  };

  const getDiscountValue = (discount) => {
    return discount.type === 'percentage' 
      ? `${discount.value}%` 
      : `₹${discount.value}`;
  };

  const getExpiryDate = (discount) => {
    return discount.validUntil || discount.expiryDate;
  };

  const getMaxUses = (discount) => {
    return discount.usageLimit || discount.maxUses;
  };

  return (
    <AdminLayout>
      <div className="discounts-admin">
        <div className="discounts-header">
          <div>
            <h1>Discount Codes</h1>
            <p>Manage promotional discount codes</p>
          </div>
          <button onClick={handleAddDiscount} className="btn btn-primary">
            <FiPlus />
            Add Discount Code
          </button>
        </div>

        <div className="discounts-grid">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="skeleton discount-card-skeleton"></div>
            ))
          ) : (
            discounts.map(discount => (
              <div key={discount._id} className="discount-card">
                <div className="discount-header">
                  <div className="discount-icon">
                    <FiPercent />
                  </div>
                  <div className="discount-actions">
                    <button 
                      onClick={() => handleEditDiscount(discount)}
                      className="btn btn-outline btn-sm"
                      style={{ marginRight: '0.5rem' }}
                    >
                      <FiEdit3 />
                    </button>
                    <button 
                      onClick={() => handleDeleteDiscount(discount._id)}
                      className="btn btn-outline btn-sm btn-danger"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="discount-info">
                  <div className="discount-code">
                    <span className="code-label">Code:</span>
                    <span className="code-value">{discount.code}</span>
                  </div>
                  
                  <div className="discount-value">
                    <span className="value-amount">{getDiscountValue(discount)}</span>
                    <span className="value-type">{getDiscountTypeLabel(discount.type)}</span>
                  </div>

                  <div className="discount-details">
                    <div className="detail-item">
                      <span>Min Order:</span>
                      <span>₹{discount.minimumOrderAmount}</span>
                    </div>
                    <div className="detail-item">
                      <span>Usage:</span>
                      <span>{discount.usedCount}/{getMaxUses(discount) || '∞'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Expires:</span>
                      <span>{new Date(getExpiryDate(discount)).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="discount-status">
                    <span className={`status-badge ${discount.isActive ? 'active' : 'inactive'}`}>
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {new Date(getExpiryDate(discount)) < new Date() && (
                      <span className="status-badge expired">Expired</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {discounts.length === 0 && !loading && (
          <div className="empty-state">
            <FiPercent />
            <h3>No discount codes found</h3>
            <p>Create your first discount code to boost sales</p>
            <button onClick={handleAddDiscount} className="btn btn-primary">
              Add Discount Code
            </button>
          </div>
        )}

        {showModal && (
          <DiscountModal
            discount={editingDiscount}
            onClose={handleModalClose}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default Discounts;