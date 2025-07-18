import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import  img5  from '../../assets/HJ.jpg';

const BannerContainer = styled.div`
  height: 50vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0;
  padding: 0;
  
  @media (max-width: 768px) {
    height: 60vh;
    margin-bottom: 0;
  }
  
  @media (max-width: 480px) {
    height: 50vh;
    margin-bottom: 0;
  }
`;

const ParallaxImage = styled.div`
  position: absolute;
  inset: 0;
  background: url(${props => props.$bgImage || img5}) center/cover;
  will-change: transform;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3));
  }
`;

const ContentOverlay = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  max-width: 600px;
  width: 90%;
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin: 0 1rem;
    width: 85%;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem;
    width: 90%;
  }
`;

const ParallaxBanner = ({ data }) => {
  return (
    <Box sx={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      <BannerContainer>
        <ParallaxImage $bgImage={data?.backgroundImage} />
        <ContentOverlay>
        <div>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
            {data?.title || 'Timeless Elegance'}
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            {data?.subtitle || 'Discover our handcrafted collection of traditional Indian wear'}
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            size="large"
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: '0.875rem', md: '1rem' },
              background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
              borderRadius: '50px',
              fontWeight: 600,
              boxShadow: '0 8px 25px rgba(212,175,55,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 35px rgba(212,175,55,0.4)'
              }
            }}
          >
            {data?.buttonText || 'Shop Collection'}
          </Button>
        </div>
        </ContentOverlay>
      </BannerContainer>
    </Box>
  );
};

export default ParallaxBanner;