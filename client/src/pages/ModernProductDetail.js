import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  Rating,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Card,
  CardContent,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ModernProductCard from '../components/ui/ModernProductCard';
import { ProductDetailSkeleton } from '../components/ui/ModernSkeleton';
import api from '../services/api';

const ProductContainer = styled.div`
  padding: 1rem 0;
  
  @media (min-width: 768px) {
    padding: 2rem 0;
  }
`;

const ImageGallery = styled.div`
  position: relative;
  
  @media (min-width: 1024px) {
    position: sticky;
    top: 100px;
  }
  
  .main-image {
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;
    position: relative;
    aspect-ratio: 3/4;
    background: #f5f5f5;
    height: 500px;
    
    @media (min-width: 768px) {
      border-radius: 20px;
      height: 600px;
    }
    
    @media (max-width: 480px) {
      height: 400px;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
  }
  
  .thumbnail-gallery {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #D4AF37;
      border-radius: 2px;
    }
    
    .thumbnail {
      min-width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      @media (min-width: 768px) {
        min-width: 80px;
        height: 80px;
        border-radius: 12px;
      }
      
      &.active {
        border-color: #D4AF37;
        transform: scale(1.05);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
`;

const ProductInfo = styled.div`
  padding: 0;
  margin-top: 1.5rem;
  
  @media (min-width: 900px) {
    padding-left: 2rem;
    margin-top: 0;
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  
  .current-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: #D4AF37;
    
    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }
  
  .original-price {
    font-size: 1rem;
    color: #999;
    text-decoration: line-through;
    
    @media (min-width: 768px) {
      font-size: 1.2rem;
    }
  }
  
  .discount {
    background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    
    @media (min-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;

const VariantSelector = styled.div`
  margin: 1.5rem 0;
  
  .variant-group {
    margin-bottom: 1.5rem;
    
    .variant-label {
      font-weight: 600;
      margin-bottom: 0.75rem;
      display: block;
      color: #333;
    }
    
    .variant-options {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      
      .variant-option {
        padding: 0.5rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        min-width: 50px;
        text-align: center;
        
        &:hover {
          border-color: #D4AF37;
        }
        
        &.selected {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.1);
          color: #D4AF37;
          font-weight: 600;
        }
        

      }
      
      .color-option {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        position: relative;
        
        &.selected::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border: 2px solid #D4AF37;
          border-radius: 50%;
        }
      }
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  width: fit-content;
  
  button {
    border: none;
    background: white;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: #f5f5f5;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .quantity {
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    min-width: 60px;
    text-align: center;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
    background: white;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 2rem 0;
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(212, 175, 55, 0.1);
    border-radius: 25px;
    font-size: 0.85rem;
    
    @media (min-width: 768px) {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
    }
    
    .feature-icon {
      color: #D4AF37;
      font-size: 1.2rem;
    }
  }
`;

const ReviewCard = styled(Card)`
  margin-bottom: 1rem !important;
  border-radius: 16px !important;
  
  .review-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .reviewer-info {
    flex: 1;
  }
  
  .review-date {
    color: #666;
    font-size: 0.9rem;
  }
`;

const TabContainer = styled.div`
  margin: 2rem 0;
  
  @media (min-width: 768px) {
    margin: 3rem 0;
  }
  
  .tab-content {
    padding: 1.5rem 0;
    
    @media (min-width: 768px) {
      padding: 2rem 0;
    }
  }
`;

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function ModernProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      // Set default selections
      if (!selectedSize && product.variants.length > 0) {
        const availableSizes = [...new Set(product.variants.map(v => v.size))];
        setSelectedSize(availableSizes[0]);
      }
      if (!selectedColor && product.variants.length > 0) {
        const availableColors = [...new Set(product.variants.map(v => v.color))];
        setSelectedColor(availableColors[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    if (selectedSize && selectedColor && product?.variants) {
      const variant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
      setSelectedVariant(variant);
    }
  }, [selectedSize, selectedColor, product]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${slug}`);
      const productData = response.data.success ? response.data.product : response.data;
      setProduct(productData);
      setIsWishlisted(productData.isInWishlist || false);
      
      // Fetch related products
      if (productData.category) {
        const categoryId = typeof productData.category === 'object' ? productData.category._id : productData.category;
        const relatedResponse = await api.get(`/products?category=${categoryId}&limit=4`);
        const relatedData = relatedResponse.data.success ? relatedResponse.data.products : relatedResponse.data;
        setRelatedProducts(relatedData?.filter(p => p._id !== productData._id) || []);
      }
      
    } catch (error) {
      console.error('Error fetching product:', error);
      setSnackbar({ open: true, message: 'Error loading product', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.variants?.length > 0) {
      if (!selectedSize) {
        setSnackbar({ open: true, message: 'Please select a size', severity: 'warning' });
        return;
      }
      if (!selectedColor) {
        setSnackbar({ open: true, message: 'Please select a color', severity: 'warning' });
        return;
      }
      if (!selectedVariant || selectedVariant.stock === 0) {
        setSnackbar({ open: true, message: 'Selected variant is out of stock', severity: 'warning' });
        return;
      }
    }
    
    addToCart({
      ...product,
      quantity,
      selectedSize,
      selectedColor,
      variant: selectedVariant
    });
    
    setSnackbar({ open: true, message: 'Added to cart successfully!', severity: 'success' });
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (isWishlisted) {
        await api.delete(`/products/${product._id}/wishlist`);
        setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'info' });
      } else {
        await api.post(`/products/${product._id}/wishlist`);
        setSnackbar({ open: true, message: 'Added to wishlist', severity: 'success' });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setSnackbar({ open: true, message: 'Error updating wishlist', severity: 'error' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
    }
  };

  const submitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!newReview.comment.trim()) {
      setSnackbar({ open: true, message: 'Please write a review comment', severity: 'warning' });
      return;
    }
    
    try {
      await api.post(`/products/${product._id}/reviews`, newReview);
      setNewReview({ rating: 5, comment: '' });
      fetchProduct(); // Refresh to get updated reviews
      setSnackbar({ open: true, message: 'Review submitted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error submitting review:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error submitting review', severity: 'error' });
    }
  };

  const getAvailableColors = () => {
    if (!product?.variants || !selectedSize) return [];
    return [...new Set(product.variants.filter(v => v.size === selectedSize).map(v => v.color))];
  };

  const getAvailableSizes = () => {
    if (!product?.variants || !selectedColor) return [];
    return [...new Set(product.variants.filter(v => v.color === selectedColor).map(v => v.size))];
  };

  const isVariantAvailable = (size, color) => {
    if (!product?.variants) return true;
    const variant = product.variants.find(v => v.size === size && v.color === color);
    return variant && variant.stock > 0;
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Product Not Found</Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </Container>
    );
  }

  const discount = product.compareAtPrice && product.price < product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const uniqueSizes = product.variants ? [...new Set(product.variants.map(v => v.size))] : [];
  const uniqueColors = product.variants ? [...new Set(product.variants.map(v => v.color))] : [];

  return (
    <ProductContainer>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
          <MuiLink component={Link} to="/" color="inherit">Home</MuiLink>
          <MuiLink component={Link} to="/products" color="inherit">Products</MuiLink>
          {product.category && (
            <MuiLink 
              component={Link} 
              to={`/products?category=${typeof product.category === 'object' ? product.category._id : product.category}`} 
              color="inherit"
            >
              {typeof product.category === 'object' ? product.category.name : 'Category'}
            </MuiLink>
          )}
          <Typography color="text.primary" sx={{ fontSize: 'inherit' }}>{product.name}</Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.8rem', md: '0.9rem' } }}
        >
          Back
        </Button>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Image Gallery */}
          <Grid item xs={12} md={6}>
            <ImageGallery>
              <div className="main-image">
                <img
                  src={product.images?.[selectedImage]?.url || '/api/placeholder/600/800'}
                  alt={product.images?.[selectedImage]?.alt || product.name}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/800';
                  }}
                />
                {discount > 0 && (
                  <Chip
                    label={`${discount}% OFF`}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                )}
              </div>
              
              {product.images?.length > 1 && (
                <div className="thumbnail-gallery">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.url || '/api/placeholder/100/100'}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/100/100';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </ImageGallery>
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <ProductInfo>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  lineHeight: 1.2
                }}
              >
                {product.name}
              </Typography>

              {product.brand && (
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary" 
                  sx={{ mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}
                >
                  by {product.brand}
                </Typography>
              )}

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Rating 
                  value={product.averageRating || 0} 
                  precision={0.1} 
                  readOnly 
                  size={isMobile ? 'small' : 'medium'}
                />
                <Typography variant="body2" color="text.secondary">
                  ({product.totalReviews || 0} reviews)
                </Typography>
              </Box>

              {/* Price */}
              <PriceSection>
                <span className="current-price">₹{product.price?.toLocaleString()}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="original-price">₹{product.compareAtPrice.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <span className="discount">{discount}% OFF</span>
                )}
              </PriceSection>

              {/* Short Description */}
              {product.shortDescription && (
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 2, fontSize: { xs: '0.9rem', md: '1rem' } }}
                >
                  {product.shortDescription}
                </Typography>
              )}

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <VariantSelector>
                  {/* Size Selection */}
                  {uniqueSizes.length > 0 && (
                    <div className="variant-group">
                      <span className="variant-label">Size:</span>
                      <div className="variant-options">
                        {uniqueSizes.map(size => {
                          const available = selectedColor ? isVariantAvailable(size, selectedColor) : true;
                          return (
                            <div
                              key={size}
                              className={`variant-option ${
                                selectedSize === size ? 'selected' : ''
                              }`}
                              onClick={() => setSelectedSize(size)}
                            >
                              {size}
                              {!available && <span style={{ fontSize: '0.7rem', color: '#999', display: 'block' }}>Out of Stock</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {uniqueColors.length > 0 && (
                    <div className="variant-group">
                      <span className="variant-label">Color:</span>
                      <div className="variant-options">
                        {uniqueColors.map(color => {
                          const available = selectedSize ? isVariantAvailable(selectedSize, color) : true;
                          const variant = product.variants.find(v => v.color === color);
                          return (
                            <div
                              key={color}
                              className={`variant-option ${
                                selectedColor === color ? 'selected' : ''
                              }`}
                              onClick={() => setSelectedColor(color)}
                              style={{
                                backgroundColor: variant?.colorCode || color.toLowerCase(),
                                color: variant?.colorCode ? 'transparent' : 'inherit',
                                minWidth: variant?.colorCode ? '40px' : 'auto',
                                height: variant?.colorCode ? '40px' : 'auto',
                                borderRadius: variant?.colorCode ? '50%' : '8px',
                                position: 'relative'
                              }}
                              title={`${color}${!available ? ' - Out of Stock' : ''}`}
                            >
                              {!variant?.colorCode && (
                                <>
                                  {color}
                                  {!available && <span style={{ fontSize: '0.7rem', color: '#999', display: 'block' }}>Out of Stock</span>}
                                </>
                              )}
                              {variant?.colorCode && !available && (
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: '0.6rem',
                                  color: '#fff',
                                  textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                                  fontWeight: 'bold'
                                }}>
                                  OOS
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stock Status */}
                  {selectedVariant && (
                    <Box sx={{ mt: 1 }}>
                      <Typography 
                        variant="body2" 
                        color={selectedVariant.stock > 0 ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 600 }}
                      >
                        {selectedVariant.stock > 0 
                          ? `${selectedVariant.stock} in stock` 
                          : 'Out of stock'
                        }
                      </Typography>
                    </Box>
                  )}
                </VariantSelector>
              )}

              {/* Quantity Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Quantity:</Typography>
                <QuantitySelector>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <RemoveIcon />
                  </button>
                  <div className="quantity">{quantity}</div>
                  <button 
                    onClick={() => {
                      const maxStock = selectedVariant?.stock || product.totalStock || 99;
                      setQuantity(Math.min(maxStock, quantity + 1));
                    }}
                    disabled={quantity >= (selectedVariant?.stock || product.totalStock || 99)}
                  >
                    <AddIcon />
                  </button>
                </QuantitySelector>
              </Box>

              {/* Action Buttons */}
              <ActionButtons>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CartIcon />}
                  onClick={handleAddToCart}
                  disabled={selectedVariant?.stock === 0}
                  sx={{
                    flex: { xs: 1, sm: 'none' },
                    minWidth: { sm: 200 },
                    py: 1.5,
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #B8941F 0%, #9A7A1A 100%)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                    }
                  }}
                >
                  {selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>

                <IconButton
                  onClick={handleWishlistToggle}
                  sx={{
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    p: 1.5,
                    '&:hover': {
                      borderColor: '#D4AF37',
                      backgroundColor: 'rgba(212, 175, 55, 0.1)'
                    }
                  }}
                >
                  {isWishlisted ? 
                    <FavoriteIcon sx={{ color: '#FF6B6B' }} /> : 
                    <FavoriteBorderIcon />
                  }
                </IconButton>

                <IconButton
                  onClick={handleShare}
                  sx={{
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    p: 1.5,
                    '&:hover': {
                      borderColor: '#D4AF37',
                      backgroundColor: 'rgba(212, 175, 55, 0.1)'
                    }
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </ActionButtons>

              {/* Features */}
              <FeatureList>
                <div className="feature-item">
                  <ShippingIcon className="feature-icon" />
                  Free Shipping
                </div>
                <div className="feature-item">
                  <SecurityIcon className="feature-icon" />
                  Secure Payment
                </div>
                <div className="feature-item">
                  <VerifiedIcon className="feature-icon" />
                  Authentic Product
                </div>
              </FeatureList>
            </ProductInfo>
          </Grid>
        </Grid>

        {/* Product Details Tabs */}
        <TabContainer>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
            >
              <Tab label="Description" />
              <Tab label="Specifications" />
              <Tab label={`Reviews (${product.totalReviews || 0})`} />
            </Tabs>
          </Box>

          <div className="tab-content">
            <TabPanel value={activeTab} index={0}>
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {product.description || 'No description available.'}
              </Typography>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={2}>
                {product.material && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Material:</Typography>
                    <Typography variant="body2">{product.material}</Typography>
                  </Grid>
                )}
                {product.careInstructions && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Care Instructions:</Typography>
                    <Typography variant="body2">{product.careInstructions}</Typography>
                  </Grid>
                )}
                {product.brand && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Brand:</Typography>
                    <Typography variant="body2">{product.brand}</Typography>
                  </Grid>
                )}
                {uniqueSizes.length > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Available Sizes:</Typography>
                    <Typography variant="body2">{uniqueSizes.join(', ')}</Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {/* Add Review Form */}
              {user && (
                <Card sx={{ mb: 3, p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Write a Review</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>Rating:</Typography>
                    <Rating
                      value={newReview.rating}
                      onChange={(e, value) => setNewReview({ ...newReview, rating: value })}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Write your review here..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={submitReview}
                    disabled={!newReview.comment.trim()}
                  >
                    Submit Review
                  </Button>
                </Card>
              )}

              {/* Reviews List */}
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review, index) => (
                  <ReviewCard key={index}>
                    <CardContent>
                      <div className="review-header">
                        <Avatar sx={{ bgcolor: '#D4AF37' }}>
                          {review.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <div className="reviewer-info">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {review.user?.name || 'Anonymous'}
                          </Typography>
                          <Rating value={review.rating} size="small" readOnly />
                        </div>
                        <Typography variant="caption" className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </div>
                      <Typography variant="body2">{review.comment}</Typography>
                    </CardContent>
                  </ReviewCard>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No reviews yet. Be the first to review this product!
                </Typography>
              )}
            </TabPanel>
          </div>
        </TabContainer>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: { xs: 4, md: 6 } }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Related Products
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {relatedProducts.map((relatedProduct) => (
                <Grid item xs={6} sm={4} md={3} key={relatedProduct._id}>
                  <ModernProductCard 
                    product={relatedProduct} 
                    onWishlistToggle={() => {}} 
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ProductContainer>
  );
}

export default ModernProductDetail;