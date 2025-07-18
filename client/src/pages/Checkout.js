import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiLock } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const itemsPrice = getTotalPrice();
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await api.post('/orders/apply-coupon', {
        code: couponCode,
        orderAmount: itemsPrice
      });

      if (response.data.success) {
        setAppliedCoupon({
          code: couponCode,
          discountAmount: response.data.discountAmount
        });
        toast.success(`Coupon applied! You saved ₹${response.data.discountAmount}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderData) => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load');
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_zC6feLBheTj2fD',
      amount: orderData.razorpayOrder.amount,
      currency: orderData.razorpayOrder.currency,
      name: 'StyleHub',
      description: `Order #${orderData.order.orderNumber}`,
      order_id: orderData.razorpayOrder.id,
      handler: async (response) => {
        try {
          const verifyResponse = await api.post('/orders/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderData.order._id
          });

          if (verifyResponse.data.success) {
            clearCart();
            toast.success('Payment successful!');
            navigate(`/orders/${orderData.order._id}`);
          }
        } catch (error) {
          toast.error('Payment verification failed');
        }
      },
      prefill: {
        name: shippingAddress.fullName,
        email: user?.email,
        contact: shippingAddress.phone
      },
      theme: {
        color: '#2563eb'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure we have valid cart items with proper structure
      if (!cartItems || cartItems.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }

      // Make sure all items have the required fields
      const validItems = cartItems.filter(item => 
        item && item.product && item.product._id && 
        item.quantity && 
        (item.size || item.product.variants?.[0]?.size) && 
        (item.color || item.product.variants?.[0]?.color)
      );

      if (validItems.length !== cartItems.length) {
        toast.error('Some items in your cart are invalid');
        navigate('/cart');
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity || 1,
          size: item.size || item.product.variants?.[0]?.size || 'M',
          color: item.color || item.product.variants?.[0]?.color || 'Default'
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        discountCode: appliedCoupon?.code,
        discountAmount
      };

      console.log('Submitting order with data:', orderData);
      const response = await api.post('/orders', orderData);

      if (response.data.success) {
        if (paymentMethod === 'razorpay') {
          await handleRazorpayPayment(response.data);
        } else {
          // COD order
          clearCart();
          toast.success('Order placed successfully!');
          navigate(`/orders/${response.data.order._id}`);
        }
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className="step active">
              <span>1</span>
              <span>Shipping</span>
            </div>
            <div className="step active">
              <span>2</span>
              <span>Payment</span>
            </div>
            <div className="step">
              <span>3</span>
              <span>Review</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              {/* Shipping Address */}
              <div className="form-section">
                <h3>
                  <FiTruck />
                  Shipping Address
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h3>
                  <FiCreditCard />
                  Payment Method
                </h3>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-info">
                      <span className="payment-title">Online Payment</span>
                      <span className="payment-desc">Pay securely with Razorpay</span>
                    </div>
                    <FiLock className="payment-icon" />
                  </label>
                  
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-info">
                      <span className="payment-title">Cash on Delivery</span>
                      <span className="payment-desc">Pay when you receive</span>
                    </div>
                    <FiTruck className="payment-icon" />
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} className="place-order-btn">
                {loading ? 'Processing...' : `Place Order - ₹${totalPrice?.toLocaleString() || 0}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={`${item.product._id}-${item.size}-${item.color}`} className="order-item">
                  <img 
                    src={item.product.images?.[0]?.url || item.product.images?.[0] || '/placeholder-image.jpg'} 
                    alt={item.product.name || 'Product'} 
                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                  />
                  <div className="item-details">
                    <h4>{item.product.name || 'Product Name'}</h4>
                    <p>{item.size || 'N/A'} / {item.color || 'N/A'}</p>
                    <p>Qty: {item.quantity || 1}</p>
                  </div>
                  <span className="item-price">₹{((item.product.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="coupon-section">
              <h4>Have a coupon code?</h4>
              {!appliedCoupon ? (
                <div className="coupon-input">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="coupon-field"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="btn btn-outline btn-sm"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="applied-coupon">
                  <span className="coupon-code">{appliedCoupon.code}</span>
                  <span className="coupon-discount">-₹{appliedCoupon.discountAmount}</span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="remove-coupon"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Items ({cartItems?.length || 0})</span>
                <span>₹{itemsPrice?.toLocaleString() || 0}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice?.toLocaleString()}`}</span>
              </div>
              <div className="price-row">
                <span>Tax (18%)</span>
                <span>₹{taxPrice?.toLocaleString() || 0}</span>
              </div>
              {appliedCoupon && (
                <div className="price-row discount">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total</span>
                <span>₹{totalPrice?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;