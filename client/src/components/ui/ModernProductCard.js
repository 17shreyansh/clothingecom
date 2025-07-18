import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Typography,
  Box,
  IconButton,
  Chip,
  Rating,
  Button,
  Tooltip
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Visibility as ViewIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import styled from 'styled-components';
import { useCart } from '../../context/CartContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const StyledCard = styled(motion.div)`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  
  @media (max-width: 768px) {
    border-radius: 8px;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 3/4;
  width: 100%;
  height: 380px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    height: 100%;
    width: 45vw;
  }
`;

const OverlayActions = styled(motion.div)`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transform: translateX(15px);
  transition: all 0.3s ease;
  
  ${StyledCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
  
  @media (max-width: 768px) {
    opacity: 1;
    transform: translateX(0);
    top: 6px;
    right: 6px;
    gap: 3px;
  }
`;

const QuickActions = styled(motion.div)`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.3s ease;
  
  ${StyledCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    opacity: 1;
    transform: translateY(0);
    bottom: 6px;
    left: 6px;
    right: 6px;
    gap: 4px;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
`;

const OriginalPrice = styled.span`
  color: #999;
  text-decoration: line-through !important;
  text-decoration-thickness: 1.5px;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const CurrentPrice = styled.span`
  color: #D4AF37;
  font-weight: 700;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const DiscountBadge = styled(Chip)`
  position: absolute !important;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 0.7rem !important;
  height: 20px !important;
`;

const ActionButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  width: 32px !important;
  height: 32px !important;
  
  svg {
    font-size: 16px;
  }
  
  &:hover {
    background: white !important;
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 28px !important;
    height: 28px !important;
    
    svg {
      font-size: 14px;
    }
  }
`;

const ModernProductCard = ({ product, onWishlistToggle, isWishlisted = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle?.(product.slug);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.origin + `/products/${product.slug}`,
      });
    }
  };

  const currentPrice = product.basePrice || product.price;
  const discount = product.originalPrice && currentPrice < product.originalPrice
    ? Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}

    >
      <Link 
        to={`/products/${product.slug}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <ImageContainer>
          <img
            src={product.images?.[0].url }
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            
          />
          
          {discount > 0 && (
            <DiscountBadge label={`${discount}% OFF`} size="small" />
          )}

          <OverlayActions>
            <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"} placement="left">
              <ActionButton onClick={handleWishlistToggle}>
                {isWishlisted ? <FavoriteIcon sx={{ color: '#FF6B6B' }} /> : <FavoriteBorderIcon />}
              </ActionButton>
            </Tooltip>
            
            <Tooltip title="Quick View" placement="left">
              <ActionButton>
                <ViewIcon />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title="Share" placement="left">
              <ActionButton onClick={handleShare}>
                <ShareIcon />
              </ActionButton>
            </Tooltip>
          </OverlayActions>

          <QuickActions>
            <Button
              variant="contained"
              startIcon={<CartIcon />}
              onClick={handleAddToCart}
              size="small"
              sx={{
                flex: 1,
                borderRadius: '8px',
                fontSize: { xs: '0.7rem', md: '0.8rem', lg: '0.9rem' },
                py: 0.5,
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B8941F 0%, #9A7A1A 100%)',
                },
              }}
            >
              Add to Cart
            </Button>
          </QuickActions>
        </ImageContainer>

        <div style={{ padding: '12px' }}>
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.3,
              mb: { xs: 0.3, md: 0.5 },
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.name || 'Product Name'}
          </Typography>



          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.3, md: 0.5 } }}>
            <Rating 
              value={product.rating || 4.5} 
              precision={0.5} 
              size="small" 
              readOnly 
              sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
              ({product.reviewCount || 0})
            </Typography>
          </Box>

          <PriceContainer>
            <CurrentPrice>₹{(product.price.toLocaleString())}</CurrentPrice>
              <OriginalPrice>₹{product.compareAtPrice.toLocaleString()}</OriginalPrice>
            
          </PriceContainer>


        </div>
      </Link>
    </StyledCard>
  );
};

export default ModernProductCard;