import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiTruck, FiRefreshCw, FiShield, FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${slug}`);
      if (response.data.success) {
        setProduct(response.data.product);
        setRelatedProducts(response.data.relatedProducts || []);
        if (response.data.product.variants?.length > 0) {
          setSelectedSize(response.data.product.variants[0].size);
          setSelectedColor(response.data.product.variants[0].color);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

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
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    toast.success('Added to wishlist');
  };

  const getSelectedVariant = () => {
    return product?.variants?.find(
      v => v.size === selectedSize && v.color === selectedColor
    );
  };

  const availableSizes = [...new Set(product?.variants?.map(v => v.size))];
  const availableColors = [...new Set(product?.variants?.map(v => v.color))];

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-skeleton">
            <div className="skeleton" style={{ height: '500px', borderRadius: '8px' }}></div>
            <div className="skeleton" style={{ height: '500px', borderRadius: '8px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="not-found">
            <h2>Product not found</h2>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = product.compareAtPrice && product.compareAtPrice > product.price 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;
  const finalPrice = product.price;
  const originalPrice = product.compareAtPrice;
  const selectedVariant = getSelectedVariant();

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category?.slug}`}>
            {product.category?.name}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img
                src={product.images?.[selectedImageIndex]?.url || '/api/placeholder/500/600'}
                alt={product.name}
              />
              {discountPercentage > 0 && (
                <span className="discount-badge">-{discountPercentage}%</span>
              )}
              {product.isNewArrival && (
                <span className="new-badge">New</span>
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

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              <p className="brand">{product.brand}</p>
              
              <div className="rating-section">
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
              </div>

              <div className="price-section">
                <span className="current-price">₹{finalPrice}</span>
                {discountPercentage > 0 && (
                  <>
                    <span className="original-price">₹{originalPrice}</span>
                    <span className="savings">You save ₹{originalPrice - finalPrice}</span>
                  </>
                )}
              </div>
            </div>

            <div className="product-options">
              {availableSizes.length > 0 && (
                <div className="option-group">
                  <label>Size: <strong>{selectedSize}</strong></label>
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
                  <Link to="#" className="size-guide">Size Guide</Link>
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="option-group">
                  <label>Color: <strong>{selectedColor}</strong></label>
                  <div className="color-options">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        className={`color-option ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                        title={color}
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
                    <FiMinus />
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    <FiPlus />
                  </button>
                </div>
                {selectedVariant && (
                  <span className="stock-info">
                    {selectedVariant.stock > 0 ? 
                      `${selectedVariant.stock} in stock` : 
                      'Out of stock'
                    }
                  </span>
                )}
              </div>
            </div>

            <div className="product-actions">
              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg"
                disabled={!selectedSize || !selectedColor || selectedVariant?.stock === 0}
              >
                <FiShoppingCart />
                Add to Cart
              </button>
              
              <button
                onClick={handleWishlist}
                className="btn btn-outline btn-lg"
              >
                <FiHeart />
                Add to Wishlist
              </button>
            </div>

            <div className="product-features">
              <div className="feature">
                <FiTruck />
                <div>
                  <strong>Free Shipping</strong>
                  <span>On orders above ₹500</span>
                </div>
              </div>
              <div className="feature">
                <FiRefreshCw />
                <div>
                  <strong>Easy Returns</strong>
                  <span>30-day return policy</span>
                </div>
              </div>
              <div className="feature">
                <FiShield />
                <div>
                  <strong>Secure Payment</strong>
                  <span>100% secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-tabs">
          <div className="tab-headers">
            <button
              className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-header ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.totalReviews || 0})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-pane">
                <p>{product.description}</p>
                {product.careInstructions && (
                  <div className="care-instructions">
                    <h4>Care Instructions</h4>
                    <p>{product.careInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-pane">
                <div className="specifications">
                  <div className="spec-row">
                    <span>Brand</span>
                    <span>{product.brand}</span>
                  </div>
                  <div className="spec-row">
                    <span>Material</span>
                    <span>{product.material || 'Not specified'}</span>
                  </div>
                  <div className="spec-row">
                    <span>Available Sizes</span>
                    <span>{availableSizes.join(', ')}</span>
                  </div>
                  <div className="spec-row">
                    <span>Available Colors</span>
                    <span>{availableColors.join(', ')}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-pane">
                <div className="reviews-section">
                  {product.reviews?.length > 0 ? (
                    <div className="reviews-list">
                      {product.reviews.slice(0, 5).map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-name">{review.user?.name || 'Anonymous'}</div>
                            <div className="review-rating">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={i < review.rating ? 'star-filled' : 'star-empty'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h3>You might also like</h3>
            <div className="products-grid">
              {relatedProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;