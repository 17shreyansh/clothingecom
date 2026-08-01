import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import styled from 'styled-components';
import logo from '../../assets/logo.png';

const LoaderContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LogoContainer = styled(motion.div)`
  margin-bottom: 2rem;
  img {
    width: 120px;
    height: auto;
    filter: brightness(0) invert(1);
  }
`;

const LoadingText = styled(motion.div)`
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  margin-top: 1rem;
  text-align: center;
`;

const UniversalLoader = ({ message = "Loading Bhuvi Creations..." }) => {
  return (
    <LoaderContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LogoContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <img src={logo} alt="Bhuvi Creations" />
      </LogoContainer>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <CircularProgress
          size={60}
          thickness={3}
          sx={{
            color: 'white',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </motion.div>

      <LoadingText
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {message}
      </LoadingText>
    </LoaderContainer>
  );
};

export default UniversalLoader;