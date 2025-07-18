import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Container, Modal, IconButton, Chip } from '@mui/material';
import { Close, ArrowBack, ArrowForward, Visibility } from '@mui/icons-material';
import styled from 'styled-components';
import { lookbookImages } from '../../assets';

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

const GalleryItem = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 3/4;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  height: 100%;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  &:hover img {
    transform: scale(1.08);
  }
  
  &:hover .overlay {
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.7), rgba(212,175,55,0.3));
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  transition: opacity 0.3s ease;
  padding: 1rem;
  
  .view-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.9;
  }
  
  @media (max-width: 480px) {
    .view-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
  }
`;

const ModalContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90vw;
  max-height: 90vh;
  outline: none;
  
  img {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
`;

const lookbook = [
  { id: 1, src: lookbookImages[0], title: 'Bridal Elegance', category: 'Wedding' },
  { id: 2, src: lookbookImages[1], title: 'Festive Glamour', category: 'Festival' },
  { id: 3, src: lookbookImages[2], title: 'Casual Chic', category: 'Casual' },
  { id: 4, src: lookbookImages[3], title: 'Party Ready', category: 'Party' },
  { id: 5, src: lookbookImages[4], title: 'Traditional Grace', category: 'Traditional' },
  { id: 6, src: lookbookImages[5], title: 'Modern Fusion', category: 'Fusion' },
  { id: 7, src: lookbookImages[6], title: 'Ethnic Charm', category: 'Ethnic' },
  { id: 8, src: lookbookImages[7], title: 'Designer Collection', category: 'Designer' }
];

const LookbookGallery = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const displayItems = data?.items && data.items.length > 0 ? data.items : lookbook;

  const openModal = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeModal = () => setSelectedImage(null);

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % displayItems.length;
    setSelectedImage(displayItems[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + displayItems.length) % displayItems.length;
    setSelectedImage(displayItems[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  return (
    <Box sx={{ py: 8, background: 'linear-gradient(135deg, #fafafa, #f0f0f0)' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#2C2C2C' }}>
            {data?.title || 'Style Lookbook'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            {data?.subtitle || 'Discover endless style possibilities with our curated fashion gallery'}
          </Typography>
        </motion.div>
        
        <GalleryGrid>
          {displayItems.map((item, index) => (
            <GalleryItem
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              onClick={() => openModal(item, index)}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <img src={item.src} alt={item.title} loading="lazy" />
              <Overlay className="overlay">
                <Visibility className="view-icon" />
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } 
                }}>
                  {item.title}
                </Typography>
                <Chip 
                  label={item.category} 
                  size="small"
                  sx={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                  }} 
                />
              </Overlay>
            </GalleryItem>
          ))}
        </GalleryGrid>
        
        <Modal open={!!selectedImage} onClose={closeModal}>
          <ModalContent>
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={selectedImage.src} alt={selectedImage.title} />
                  
                  <IconButton
                    onClick={closeModal}
                    sx={{
                      position: 'absolute',
                      top: 15,
                      right: 15,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      width: 50,
                      height: 50,
                      '&:hover': { background: 'rgba(0,0,0,0.8)' }
                    }}
                  >
                    <Close />
                  </IconButton>
                  
                  <IconButton
                    onClick={prevImage}
                    sx={{
                      position: 'absolute',
                      left: 15,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      width: 50,
                      height: 50,
                      '&:hover': { background: 'rgba(0,0,0,0.8)' }
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      position: 'absolute',
                      right: 15,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      width: 50,
                      height: 50,
                      '&:hover': { background: 'rgba(0,0,0,0.8)' }
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </motion.div>
              )}
            </AnimatePresence>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default LookbookGallery;