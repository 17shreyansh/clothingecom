import React, { useState } from 'react';
import { FiX, FiPackage, FiUser, FiCreditCard, FiMapPin, FiEdit3 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './OrderDetailModal.css';

function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(order.orderStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [note, setNote] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'info' },
    { value: 'packed', label: 'Packed', color: 'primary' },
    { value: 'shipped', label: 'Shipped', color: 'success' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  const handleUpdateStatus = async () => {
    if (newStatus === order.orderStatus && !trackingNumber && !note) {
      toast.info('No changes to update');
      return;
    }

    setUpdatingStatus(true);
    try {
      await onUpdateStatus(order._id, newStatus, note, trackingNumber);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'warning';
  };

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Order Details</h2>
            <p>#{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <div className="modal-content">
          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-icon">
                  <FiPackage />
                </div>
                <div>
                  <h4>Order Status</h4>
                  <span className={`status-badge status-${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">
                  <FiCreditCard />
                </div>
                <div>
                  <h4>Payment</h4>
                  <p>{order.paymentInfo.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                  <span className={`payment-status ${order.paymentInfo.status}`}>
                    {order.paymentInfo.status}
                  </span>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">
                  <FiUser />
                </div>
                <div>
                  <h4>Customer</h4>
                  <p>{order.user?.name}</p>
                  <p className="text-secondary">{order.user?.email}</p>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">
                  <FiMapPin />
                </div>
                <div>
                  <h4>Order Date</h4>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-secondary">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items">
            <h3>Order Items</h3>
            <div className="items-list">
              {order.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-image">
                    <img
                      src={item.image || '/api/placeholder/60/75'}
                      alt={item.name}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Size: {item.size}, Color: {item.color}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    <span>₹{item.price}</span>
                    <small>₹{item.subtotal} total</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="shipping-address">
            <h3>Shipping Address</h3>
            <div className="address-card">
              <h4>{order.shippingAddress.fullName}</h4>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          </div>

          {/* Order Total */}
          <div className="order-total">
            <h3>Order Total</h3>
            <div className="total-breakdown">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{order.itemsPrice}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>₹{order.shippingPrice}</span>
              </div>
              <div className="total-row">
                <span>Tax</span>
                <span>₹{order.taxPrice}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="total-row discount">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="total-row final-total">
                <span>Total</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="status-update">
            <h3>
              <FiEdit3 />
              Update Order Status
            </h3>
            <div className="update-form">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-select"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {(newStatus === 'shipped' || order.trackingNumber) && (
                <div className="form-group">
                  <label>Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this status update"
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="btn btn-primary"
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="status-history">
              <h3>Status History</h3>
              <div className="history-timeline">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>{history.status}</h4>
                      <p>{new Date(history.timestamp).toLocaleString()}</p>
                      {history.note && <p className="history-note">{history.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;