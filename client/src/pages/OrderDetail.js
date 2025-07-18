import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '8px' }}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="text-center">
          <h2>Order not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Order Details</h1>
      
      <div className="card">
        <div className="card-header">
          <h3>Order #{order.orderNumber}</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h4>Order Information</h4>
              <p>Status: <span style={{ textTransform: 'capitalize' }}>{order.orderStatus}</span></p>
              <p>Total: ₹{order.totalPrice}</p>
              <p>Payment: {order.paymentInfo.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              
              {order.packingTimeDays && order.orderStatus === 'confirmed' && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #e8f5e8, #f0f8f0)', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  marginTop: '1rem',
                  border: '2px solid #4caf50',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>📦</span>
                    <h4 style={{ color: '#2e7d32', margin: '0', fontSize: '18px', fontWeight: '700' }}>Packing Information</h4>
                  </div>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    padding: '15px', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1b5e20' }}>
                      {order.packingMessage || `Your order will start packing within ${order.packingTimeDays} business day${order.packingTimeDays > 1 ? 's' : ''}`}
                    </p>
                    {order.packingStartDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>📅</span>
                        <p style={{ margin: '0', fontSize: '14px', color: '#388e3c', fontWeight: '500' }}>
                          Expected packing start: <strong>{new Date(order.packingStartDate).toLocaleDateString()}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h4>Shipping Address</h4>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h4>Items</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {order.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                  <img
                    src={item.image || '/api/placeholder/80/100'}
                    alt={item.name}
                    style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h5>{item.name}</h5>
                    <p>Size: {item.size}, Color: {item.color}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{item.price}</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: '600' }}>₹{item.subtotal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;