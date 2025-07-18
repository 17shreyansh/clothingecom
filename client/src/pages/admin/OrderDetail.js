import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiUser, FiMapPin, FiCreditCard, FiEdit3, FiClock } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './OrderDetail.css';

const PackingTimeSection = ({ order, onUpdate }) => {
  const [packingDays, setPackingDays] = useState(order.packingTimeDays || '');
  const [packingMessage, setPackingMessage] = useState(order.packingMessage || '');
  const [updating, setUpdating] = useState(false);

  const handlePackingUpdate = async () => {
    if (!packingDays) return;
    
    setUpdating(true);
    try {
      const packingStartDate = new Date();
      packingStartDate.setDate(packingStartDate.getDate() + parseInt(packingDays));
      
      await api.patch(`/orders/${order._id}/packing`, {
        packingTimeDays: parseInt(packingDays),
        packingStartDate,
        packingMessage: packingMessage || `Your order will start packing within ${packingDays} business day${packingDays > 1 ? 's' : ''}`
      });
      
      toast.success('Packing time updated successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update packing time');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="detail-card" style={{ background: '#f8f9fa', border: '2px solid #e9ecef' }}>
      <h3 style={{ color: '#495057', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <FiClock style={{ color: '#007bff' }} />
        📦 Packing Information
      </h3>
      
      {order.packingTimeDays ? (
        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #c3e6cb' }}>
          <h4 style={{ color: '#155724', margin: '0 0 8px 0' }}>✅ Packing Time Set</h4>
          <p style={{ margin: '0', color: '#155724' }}>
            <strong>{order.packingTimeDays} day{order.packingTimeDays > 1 ? 's' : ''}</strong> - 
            Start Date: <strong>{new Date(order.packingStartDate).toLocaleDateString()}</strong>
          </p>
          {order.packingMessage && (
            <p style={{ margin: '8px 0 0 0', fontStyle: 'italic', color: '#155724' }}>
              "{order.packingMessage}"
            </p>
          )}
        </div>
      ) : (
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffeaa7' }}>
          <p style={{ margin: '0', color: '#856404' }}>⏳ No packing time set for this order</p>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Days:</label>
          <input
            type="number"
            min="1"
            max="30"
            value={packingDays}
            onChange={(e) => setPackingDays(e.target.value)}
            placeholder="1-30"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #ced4da',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Message:</label>
          <textarea
            value={packingMessage}
            onChange={(e) => setPackingMessage(e.target.value)}
            placeholder="Custom message for customer (optional)"
            rows="2"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #ced4da',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>
      </div>
      
      <button
        onClick={handlePackingUpdate}
        disabled={updating || !packingDays}
        style={{
          marginTop: '15px',
          padding: '12px 24px',
          background: updating || !packingDays ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: updating || !packingDays ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {updating ? '⏳ Updating...' : '📦 Set Packing Time'}
      </button>
    </div>
  );
};

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'info' },
    { value: 'packed', label: 'Packed', color: 'primary' },
    { value: 'shipped', label: 'Shipped', color: 'success' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.order);
        setNewStatus(response.data.order.orderStatus);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === order.orderStatus) return;

    try {
      setUpdating(true);
      const response = await api.patch(`/admin/orders/${id}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        toast.success('Order status updated successfully');
        setOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj?.color || 'warning';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="order-detail-loading">
          <div className="skeleton" style={{ height: '200px', marginBottom: '2rem' }}></div>
          <div className="skeleton" style={{ height: '300px' }}></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="order-not-found">
          <h2>Order not found</h2>
          <button onClick={() => navigate('/admin/orders')} className="btn btn-primary">
            Back to Orders
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="order-detail-admin">
        <div className="order-detail-header">
          <button onClick={() => navigate('/admin/orders')} className="back-btn">
            <FiArrowLeft />
            Back to Orders
          </button>
          <div className="order-title">
            <h1>Order #{order.orderNumber}</h1>
            <span className={`status-badge ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="order-detail-content">
          <div className="order-main">
            {/* Status Update */}
            <div className="detail-card">
              <h3>
                <FiEdit3 />
                Update Order Status
              </h3>
              <div className="status-update">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === order.orderStatus}
                  className="btn btn-primary"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            {/* Packing Time */}
            {order.orderStatus === 'confirmed' && (
              <PackingTimeSection order={order} onUpdate={fetchOrder} />
            )}

            {/* Order Items */}
            <div className="detail-card">
              <h3>
                <FiPackage />
                Order Items ({order.items.length})
              </h3>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>{item.size} / {item.color}</p>
                      <p>₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="item-total">
                      ₹{item.subtotal}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="detail-card">
              <h3>
                <FiUser />
                Customer Information
              </h3>
              <div className="customer-info">
                <p><strong>Name:</strong> {order.user?.name}</p>
                <p><strong>Email:</strong> {order.user?.email}</p>
                <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="detail-card">
              <h3>
                <FiMapPin />
                Shipping Address
              </h3>
              <div className="shipping-address">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.pincode}, {order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          <div className="order-sidebar">
            {/* Order Summary */}
            <div className="detail-card">
              <h3>Order Summary</h3>
              <div className="order-summary">
                <div className="summary-row">
                  <span>Items Price:</span>
                  <span>₹{order.itemsPrice}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>₹{order.shippingPrice}</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>₹{order.taxPrice}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="summary-row">
                    <span>Discount:</span>
                    <span>-₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="detail-card">
              <h3>
                <FiCreditCard />
                Payment Information
              </h3>
              <div className="payment-info">
                <p><strong>Method:</strong> {order.paymentInfo.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                <p><strong>Status:</strong> 
                  <span className={`payment-status ${order.paymentInfo.status}`}>
                    {order.paymentInfo.status.charAt(0).toUpperCase() + order.paymentInfo.status.slice(1)}
                  </span>
                </p>
                {order.paymentInfo.paidAt && (
                  <p><strong>Paid At:</strong> {new Date(order.paymentInfo.paidAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="detail-card">
              <h3>Order Timeline</h3>
              <div className="order-timeline">
                <div className="timeline-item">
                  <span>Order Placed</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                {order.paymentInfo.paidAt && (
                  <div className="timeline-item">
                    <span>Payment Confirmed</span>
                    <span>{new Date(order.paymentInfo.paidAt).toLocaleString()}</span>
                  </div>
                )}
                {order.packingStartDate && (
                  <div className="timeline-item">
                    <span>Packing Starts</span>
                    <span>{new Date(order.packingStartDate).toLocaleDateString()}</span>
                  </div>
                )}
                {order.shippedAt && (
                  <div className="timeline-item">
                    <span>Shipped</span>
                    <span>{new Date(order.shippedAt).toLocaleString()}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="timeline-item">
                    <span>Delivered</span>
                    <span>{new Date(order.deliveredAt).toLocaleString()}</span>
                  </div>
                )}
                {order.cancelledAt && (
                  <div className="timeline-item">
                    <span>Cancelled</span>
                    <span>{new Date(order.cancelledAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrderDetail;