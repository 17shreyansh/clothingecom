import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiEye, FiX, FiClock, FiCheck, FiTruck } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/orders', { params });
      
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by user'
      });

      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="status-icon pending" />;
      case 'confirmed': return <FiCheck className="status-icon confirmed" />;
      case 'packed': return <FiPackage className="status-icon packed" />;
      case 'shipped': return <FiTruck className="status-icon shipped" />;
      case 'delivered': return <FiCheck className="status-icon delivered" />;
      case 'cancelled': return <FiX className="status-icon cancelled" />;
      default: return <FiClock className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'packed': return 'primary';
      case 'shipped': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const canCancelOrder = (order) => {
    return ['pending', 'confirmed'].includes(order.orderStatus);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="orders-loading">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton order-card-skeleton"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <div className="orders-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Delivered
            </button>
            <button
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <FiPackage />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.orderNumber}</h3>
                    <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.orderStatus)}
                    <span className={`status-text ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="order-item">
                      <img 
                        src={item.image || '/api/placeholder/60/75'} 
                        alt={item.name}
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>{item.size} / {item.color}</p>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total: ₹{order.totalPrice}</span>
                    <span className="payment-method">
                      {order.paymentInfo.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                  <div className="order-actions">
                    <Link 
                      to={`/orders/${order._id}`} 
                      className="btn btn-outline btn-sm"
                    >
                      <FiEye />
                      View Details
                    </Link>
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn btn-outline btn-sm btn-danger"
                      >
                        <FiX />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="tracking-info">
                    <span>Tracking: {order.trackingNumber}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;