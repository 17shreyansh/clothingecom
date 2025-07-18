import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Cart.css';

function Cart() {
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, size, color, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, size, color, newQuantity);
  };

  const handleRemoveItem = (productId, size, color) => {
    removeFromCart(productId, size, color);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="container">
          <div className="empty-cart">
            <FiShoppingBag size={64} />
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="btn btn-outline btn-sm"
          >
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {items.map((item) => (
              <div key={`${item.product._id}-${item.size}-${item.color}`} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.product.images?.[0]?.url || '/api/placeholder/150/200'}
                    alt={item.product.name}
                  />
                </div>

                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p className="item-brand">{item.product.brand}</p>
                  <div className="item-variants">
                    <span>Size: {item.size}</span>
                    <span>Color: {item.color}</span>
                  </div>
                  <p className="item-price">₹{item.product.price}</p>
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => handleQuantityChange(
                      item.product._id,
                      item.size,
                      item.color,
                      item.quantity - 1
                    )}
                    className="quantity-btn"
                    disabled={item.quantity <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(
                      item.product._id,
                      item.size,
                      item.color,
                      item.quantity + 1
                    )}
                    className="quantity-btn"
                  >
                    <FiPlus />
                  </button>
                </div>

                <div className="item-total">
                  <p>₹{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.product._id, item.size, item.color)}
                  className="remove-btn"
                  title="Remove item"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span>{total >= 500 ? 'Free' : '₹50'}</span>
              </div>
              
              <div className="summary-row">
                <span>Tax (18% GST)</span>
                <span>₹{(total * 0.18).toFixed(2)}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{(total + (total >= 500 ? 0 : 50) + (total * 0.18)).toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="btn btn-primary btn-full"
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;