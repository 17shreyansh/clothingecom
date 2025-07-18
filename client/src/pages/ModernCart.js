import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Divider,
  TextField,
  Chip,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalOffer as CouponIcon,
  Security as SecurityIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartContainer = styled.div`
  min-height: 80vh;
  padding: 2rem 0;
`;

const CartItem = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const ProductImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 600px) {
    width: 80px;
    height: 80px;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  padding-left: 1.5rem;
  
  @media (max-width: 600px) {
    padding-left: 1rem;
  }
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  width: fit-content;
  
  button {
    border: none;
    background: white;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 40px;
    height: 40px;
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
    padding: 0.5rem 1rem;
    font-weight: 600;
    min-width: 50px;
    text-align: center;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
  }
`;

const OrderSummary = styled(Card)`
  position: sticky !important;
  top: 100px;
  border-radius: 20px !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
`;

const CouponSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  
  .coupon-input {
    flex: 1;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  .empty-icon {
    font-size: 4rem;
    color: #ccc;
    margin-bottom: 1rem;
  }
`;

const SecurityBadges = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
  
  .badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-size: 0.9rem;
    
    .badge-icon {
      color: #D4AF37;
    }
  }
`;

function ModernCart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = getTotalPrice();
  const shipping = subtotal > 999 ? 0 : 99;
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const total = subtotal + shipping - discount;

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item.product._id, item.size, item.color);
    } else {
      updateQuantity(item.product._id, item.size, item.color, newQuantity);
    }
  };

  const applyCoupon = () => {
    // Mock coupon validation
    const validCoupons = {
      'WELCOME10': { discount: 10, description: '10% off on first order' },
      'SAVE20': { discount: 20, description: '20% off on orders above ₹2000' },
      'FESTIVE25': { discount: 25, description: '25% festive discount' }
    };

    if (validCoupons[couponCode.toUpperCase()]) {
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        ...validCoupons[couponCode.toUpperCase()]
      });
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <CartContainer>
        <Container maxWidth="lg">
          <EmptyCart>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ShoppingBagIcon className="empty-icon" />
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                Your Cart is Empty
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Looks like you haven't added any items to your cart yet.
              </Typography>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                size="large"
                sx={{ px: 4 }}
              >
                Continue Shopping
              </Button>
            </motion.div>
          </EmptyCart>
        </Container>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
            Shopping Cart
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <CartItem
                  key={`${item.product._id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <ProductImage>
                      <img
                        src={item.product.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                      />
                    </ProductImage>

                    <ProductInfo>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                          {item.product.name}
                        </Typography>
                        <IconButton
                          onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                          sx={{ color: '#FF6B6B' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.product.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {item.size && (
                          <Chip label={`Size: ${item.size}`} size="small" variant="outlined" />
                        )}
                        {item.color && (
                          <Chip label={`Color: ${item.color}`} size="small" variant="outlined" />
                        )}
                      </Box>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                      }}>
                        <QuantityControls>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          >
                            <RemoveIcon fontSize="small" />
                          </button>
                          <div className="quantity">{item.quantity}</div>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </button>
                        </QuantityControls>

                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#D4AF37' }}>
                          ₹{((item.product.price || 0) * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                    </ProductInfo>
                  </Box>
                </CartItem>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Box sx={{ mt: 3 }}>
              <Button
                component={Link}
                to="/products"
                variant="outlined"
                startIcon={<ShoppingBagIcon />}
              >
                Continue Shopping
              </Button>
            </Box>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <OrderSummary>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                    Order Summary
                  </Typography>

                  {/* Coupon Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Promo Code
                    </Typography>
                    {appliedCoupon ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 1,
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(76, 175, 80, 0.3)'
                      }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                            {appliedCoupon.code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appliedCoupon.description}
                          </Typography>
                        </Box>
                        <Button size="small" onClick={removeCoupon} sx={{ color: '#4CAF50' }}>
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      <CouponSection>
                        <TextField
                          className="coupon-input"
                          size="small"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          error={!!couponError}
                          helperText={couponError}
                        />
                        <Button
                          variant="outlined"
                          onClick={applyCoupon}
                          startIcon={<CouponIcon />}
                          disabled={!couponCode.trim()}
                        >
                          Apply
                        </Button>
                      </CouponSection>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Price Breakdown */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Subtotal</Typography>
                      <Typography variant="body1">₹{(subtotal || 0).toLocaleString()}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Shipping</Typography>
                      <Typography variant="body1" sx={{ color: shipping === 0 ? '#4CAF50' : 'inherit' }}>
                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                      </Typography>
                    </Box>

                    {discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ color: '#4CAF50' }}>
                          Discount ({appliedCoupon.discount}%)
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4CAF50' }}>
                          -₹{(discount || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {subtotal < 999 && (
                      <Alert severity="info" sx={{ mt: 2, fontSize: '0.875rem' }}>
                        Add ₹{Math.max(0, 999 - (subtotal || 0)).toLocaleString()} more for FREE shipping!
                      </Alert>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#D4AF37' }}>
                      ₹{(total || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleCheckout}
                    sx={{ mb: 2, py: 1.5 }}
                  >
                    Proceed to Checkout
                  </Button>

                  <SecurityBadges>
                    <div className="badge">
                      <SecurityIcon className="badge-icon" fontSize="small" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="badge">
                      <ShippingIcon className="badge-icon" fontSize="small" />
                      <span>Fast Delivery</span>
                    </div>
                  </SecurityBadges>
                </CardContent>
              </OrderSummary>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </CartContainer>
  );
}

export default ModernCart;