import React, { useState } from 'react';
import { FiX, FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './QuickViewModal.css';

function QuickViewModal({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  React.useEffect(() => {
    if (product.variants?.length > 0) {
      setSelectedSize(product.variants[0].size);
      setSelectedColor(product.variants[0].color);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    toast.success('Product added to cart');
    onClose();
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    toast.success('Added to wishlist');
  };

  const availableSizes = [...new Set(product.variants?.map(v => v.size))];
  const availableColors = [...new Set(product.variants?.map(v => v.color))];

  const discountPercentage = product.compareAtPrice && product.compareAtPrice > product.price 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;
  const finalPrice = product.price;
  const originalPrice = product.compareAtPrice;

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>

        <div className="quick-view-content">
          <div className="quick-view-images">
            <div className="main-image">
              <img
                src={product.images?.[selectedImageIndex]?.url || '/api/placeholder/400/500'}
                alt={product.name}
              />
              {discountPercentage > 0 && (
                <span className="discount-badge">-{discountPercentage}%</span>
              )}
            </div>
            
            {product.images?.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image.url} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="quick-view-details">
            <div className="product-header">
              <h2>{product.name}</h2>
              <p className="brand">{product.brand}</p>
              
              <div className="rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={i < Math.floor(product.averageRating || 0) ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {product.averageRating || 0} ({product.totalReviews || 0} reviews)
                </span>
              </div>

              <div className="price">
                <span className="current-price">₹{finalPrice}</span>
                {discountPercentage > 0 && (
                  <span className="original-price">₹{originalPrice}</span>
                )}
              </div>
            </div>

            <div className="product-options">
              {availableSizes.length > 0 && (
                <div className="option-group">
                  <label>Size</label>
                  <div className="size-options">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        className={`size-option ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="option-group">
                  <label>Color</label>
                  <div className="color-options">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        className={`color-option ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                      >
                        <div 
                          className="color-swatch"
                          style={{ backgroundColor: color.toLowerCase() }}
                        ></div>
                        <span>{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="option-group">
                <label>Quantity</label>
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="product-actions">
              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-full"
                disabled={!selectedSize || !selectedColor}
              >
                <FiShoppingCart />
                Add to Cart
              </button>
              
              <button
                onClick={handleWishlist}
                className="btn btn-outline"
              >
                <FiHeart />
                Add to Wishlist
              </button>
            </div>

            {product.shortDescription && (
              <div className="product-description">
                <h4>Description</h4>
                <p>{product.shortDescription}</p>
              </div>
            )}

            <div className="product-features">
              <div className="feature">
                <strong>Free Shipping</strong>
                <span>On orders above ₹500</span>
              </div>
              <div className="feature">
                <strong>Easy Returns</strong>
                <span>30-day return policy</span>
              </div>
              <div className="feature">
                <strong>Secure Payment</strong>
                <span>100% secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;