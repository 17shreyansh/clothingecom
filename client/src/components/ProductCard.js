import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import QuickViewModal from './QuickViewModal';
import './ProductCard.css';

function ProductCard({ product, viewMode = 'grid' }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const firstVariant = product.variants?.[0];
    if (!firstVariant) {
      toast.error('Product variants not available');
      return;
    }

    addToCart(product, firstVariant.size, firstVariant.color, 1);
    toast.success('Product added to cart');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    setShowQuickView(true);
  };

  const finalPrice = product.price || 0;
  const originalPrice = product.compareAtPrice;
  const discountPercentage = originalPrice && originalPrice > finalPrice 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) 
    : 0;

  if (viewMode === 'list') {
    return (
      <>
        <div className="product-card product-card-list">
          <Link to={`/products/${product.slug}`} className="product-link">
            <div className="product-image">
              <img
                src={product.images?.[0]?.url || '/api/placeholder/200/250'}
                alt={product.name}
                loading="lazy"
              />
              {discountPercentage > 0 && (
                <span className="discount-badge">-{discountPercentage}%</span>
              )}
              {product.isNewArrival && (
                <span className="new-badge">New</span>
              )}
            </div>
            
            <div className="product-info">
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-description">{product.shortDescription}</p>
                
                <div className="product-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={i < Math.floor(product.averageRating || 0) ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                  </div>
                  <span className="rating-text">
                    ({product.totalReviews || 0} reviews)
                  </span>
                </div>
                
                <div className="product-price">
                  <span className="current-price">₹{finalPrice}</span>
                  {discountPercentage > 0 && (
                    <span className="original-price">₹{originalPrice}</span>
                  )}
                </div>

                <div className="product-variants">
                  <div className="available-sizes">
                    <span>Sizes: </span>
                    {[...new Set(product.variants?.map(v => v.size))].slice(0, 4).map(size => (
                      <span key={size} className="size-tag">{size}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="product-actions-list">
                <button
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>
                <button
                  className={`action-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlist}
                  title="Add to Wishlist"
                >
                  <FiHeart />
                </button>
                <button
                  className="action-btn"
                  onClick={handleQuickView}
                  title="Quick View"
                >
                  <FiEye />
                </button>
              </div>
            </div>
          </Link>
        </div>
        
        {showQuickView && (
          <QuickViewModal
            product={product}
            onClose={() => setShowQuickView(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="product-card">
        <Link to={`/products/${product.slug}`} className="product-link">
          <div className="product-image">
            <img
              src={product.images?.[0]?.url || '/api/placeholder/300/400'}
              alt={product.name}
              loading="lazy"
            />
            {product.images?.[1] && (
              <img
                src={product.images[1].url}
                alt={product.name}
                className="product-image-hover"
                loading="lazy"
              />
            )}
            {discountPercentage > 0 && (
              <span className="discount-badge">-{discountPercentage}%</span>
            )}
            {product.isNewArrival && (
              <span className="new-badge">New</span>
            )}
            {product.isFeatured && (
              <span className="featured-badge">Featured</span>
            )}
          </div>
          
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-brand">{product.brand}</p>
            
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={i < Math.floor(product.averageRating || 0) ? 'star-filled' : 'star-empty'}
                  />
                ))}
              </div>
              <span className="rating-text">
                ({product.totalReviews || 0})
              </span>
            </div>
            
            <div className="product-price">
              <span className="current-price">₹{finalPrice}</span>
              {discountPercentage > 0 && (
                <span className="original-price">₹{originalPrice}</span>
              )}
            </div>

            <div className="product-colors">
              {[...new Set(product.variants?.map(v => v.color))].slice(0, 4).map(color => (
                <div
                  key={color}
                  className="color-dot"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                ></div>
              ))}
            </div>
          </div>
        </Link>
        
        <div className="product-actions">
          <button
            className={`action-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            title="Add to Wishlist"
          >
            <FiHeart />
          </button>
          <button
            className="action-btn"
            onClick={handleQuickView}
            title="Quick View"
          >
            <FiEye />
          </button>
          <button
            className="action-btn cart-btn"
            onClick={handleAddToCart}
            title="Add to Cart"
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>
      
      {showQuickView && (
        <QuickViewModal
          product={product}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
}

export default ProductCard;