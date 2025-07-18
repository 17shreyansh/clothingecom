// src/pages/ModernHome.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import styled from 'styled-components';
import ModernProductCard from '../components/ui/ModernProductCard';
import { ProductGridSkeleton } from '../components/ui/ModernSkeleton';
import api from '../services/api';
import { getHomepageContent } from '../services/homepageService';
import ImageShowcase from '../components/ui/ImageShowcase';
import TrustBadges from '../components/ui/TrustBadges';
import HeroSection from '../components/HeroSection';
import CategoryShowcase from '../components/ui/CategoryShowcase';
import ParallaxBanner from '../components/ui/ParallaxBanner';
import StatsCounter from '../components/ui/StatsCounter';
import LookbookGallery from '../components/ui/LookbookGallery';
import InstagramFeed from '../components/ui/InstagramFeed';
import TestimonialCard from '../components/ui/TestimonialSlider';


const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  @media (min-width: 900px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 28px;
  }
`;

function ModernHome() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homepageContent, setHomepageContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    fetchFeaturedProducts();
    fetchHomepageContent();
  }, []);
  
  const fetchHomepageContent = async () => {
    try {
      const response = await getHomepageContent();
      if (response.success) {
        setHomepageContent(response.data);
      }
    } catch (err) {
      console.error('Error fetching homepage content:', err);
    } finally {
      setContentLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products?featured=true&limit=8');
      if (response.data && Array.isArray(response.data.products)) {
        setFeaturedProducts(response.data.products);
      } else {
        setFeaturedProducts([]);
        console.warn("API response for featured products did not contain a valid 'products' array.");
      }
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Render sections with dynamic content
  const renderDynamicSections = () => {
    if (!homepageContent) return null;

    return (
      <>
        {homepageContent.heroSection?.enabled && (
          <HeroSection data={homepageContent.heroSection} />
        )}
        
        {homepageContent.categoryShowcase?.enabled && (
          <CategoryShowcase data={homepageContent.categoryShowcase} />
        )}
        
        {homepageContent.featuredProducts?.enabled && (
          <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
              <Typography variant="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
                {homepageContent.featuredProducts.title || 'Featured Products'}
              </Typography>
              {homepageContent.featuredProducts.subtitle && (
                <Typography variant="h6" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
                  {homepageContent.featuredProducts.subtitle}
                </Typography>
              )}
            {loading ? (
              <ProductGridSkeleton count={isMobileOrTablet ? 2 : 8} />
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 5, color: 'error.main' }}>
                <ErrorOutlineIcon sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6">{error}</Typography>
              </Box>
            ) : featuredProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">No featured products found at the moment.</Typography>
                <Button component={Link} to="/products" variant="outlined" sx={{ mt: 3 }}>
                  Browse All Products
                </Button>
              </Box>
            ) : (
              <ProductsGrid>
                {featuredProducts.map((product) => (
                  <ModernProductCard key={product._id} product={product} />
                ))}
              </ProductsGrid>
            )}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: '50px',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(135deg, #B8941F, #D4AF37)',
                  },
                }}
              >
                {homepageContent.featuredProducts.buttonText || 'View All Products'}
              </Button>
            </Box>
          </Container>
        </Box>
        )}
        
        {homepageContent.trustBadges?.enabled && (
          <TrustBadges data={homepageContent.trustBadges} />
        )}
        {(homepageContent.imageShowcase?.enabled !== false) && (
          <ImageShowcase data={homepageContent.imageShowcase} />
        )}
        
        {homepageContent.parallaxBanner?.enabled && (
          <ParallaxBanner data={homepageContent.parallaxBanner} />
        )}
        
        {homepageContent.statsCounter?.enabled && (
          <StatsCounter 
            title={homepageContent.statsCounter.title}
            subtitle={homepageContent.statsCounter.subtitle}
            stats={homepageContent.statsCounter.stats}
          />
        )}
        
        {homepageContent.lookbookGallery?.enabled && (
          <LookbookGallery data={homepageContent.lookbookGallery} />
        )}
        {homepageContent.instagramFeed?.enabled && (
          <InstagramFeed data={homepageContent.instagramFeed} />
        )}
        {homepageContent.testimonials?.enabled && (
          <TestimonialCard data={homepageContent.testimonials} />
        )}
      </>
    );
  };

  if (contentLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {contentLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      ) : homepageContent ? (
        renderDynamicSections()
      ) : (
        <>
          <HeroSection />
          <CategoryShowcase />
          <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
              <Typography variant="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
                Featured Products
              </Typography>
              {loading ? (
                <ProductGridSkeleton count={isMobileOrTablet ? 2 : 8} />
              ) : error ? (
                <Box sx={{ textAlign: 'center', py: 5, color: 'error.main' }}>
                  <ErrorOutlineIcon sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h6">{error}</Typography>
                </Box>
              ) : featuredProducts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="h6" color="text.secondary">No featured products found at the moment.</Typography>
                  <Button component={Link} to="/products" variant="outlined" sx={{ mt: 3 }}>
                    Browse All Products
                  </Button>
                </Box>
              ) : (
                <ProductsGrid>
                  {featuredProducts.map((product) => (
                    <ModernProductCard key={product._id} product={product} />
                  ))}
                </ProductsGrid>
              )}
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button
                  component={Link}
                  to="/products"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      background: 'linear-gradient(135deg, #B8941F, #D4AF37)',
                    },
                  }}
                >
                  View All Products
                </Button>
              </Box>
            </Container>
          </Box>
          <TrustBadges />
          <ImageShowcase />
          <ParallaxBanner />
          <InstagramFeed />
          <StatsCounter />
          <LookbookGallery />
          <TestimonialCard />
        </>
      )}
    </Box>
  );
}

export default ModernHome;