import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeroContainer = styled.section`
  height: 100vh;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.9), rgba(184, 148, 31, 0.8)),
              url('/hero-bg.jpg') center/cover;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const FloatingElements = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  
  .float-1 { top: 10%; left: 10%; animation: float 6s ease-in-out infinite; }
  .float-2 { top: 20%; right: 15%; animation: float 8s ease-in-out infinite reverse; }
  .float-3 { bottom: 30%; left: 20%; animation: float 7s ease-in-out infinite; }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
`;

const HeroShowcase = () => (
  <HeroContainer>
    <FloatingElements>
      <div className="float-1">✨</div>
      <div className="float-2">🌸</div>
      <div className="float-3">💫</div>
    </FloatingElements>
    
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', color: 'white' }}
      >
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, fontWeight: 800, mb: 2 }}>
          Bhuvi Creations
        </Typography>
        <Typography variant="h4" sx={{ mb: 4, opacity: 0.9 }}>
          Where Tradition Meets Elegance
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          sx={{
            px: 4, py: 2, fontSize: '1.2rem',
            background: 'white', color: '#D4AF37',
            '&:hover': { background: 'rgba(255,255,255,0.9)' }
          }}
        >
          Explore Collection
        </Button>
      </motion.div>
    </Container>
  </HeroContainer>
);

export default HeroShowcase;