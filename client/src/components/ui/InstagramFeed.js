import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, IconButton, Button } from '@mui/material';
import { Instagram, Favorite, ChatBubbleOutline } from '@mui/icons-material';
import styled from 'styled-components';
import { instagramImages } from '../../assets';

// --- STYLED COMPONENTS ---

// Main container for the entire feed section
const FeedContainer = styled.section`
  padding: 5rem 0;
  background: #fdfdfd;
`;

// New Masonry Layout Container
// This uses CSS Columns to create the masonry effect.
// It's responsive and adjusts the number of columns based on screen width.
const MasonryGrid = styled(Box)`
  column-count: 3;
  column-gap: 1.5rem;
  
  @media (max-width: 992px) {
    column-count: 2;
  }
  
  @media (max-width: 600px) {
    column-count: 1;
  }
`;

// The Instagram Card component
// I've added 'break-inside: avoid' to prevent cards from splitting across columns.
// A margin-bottom is added for vertical spacing.
const InstagramCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #eef0f2;
  margin-bottom: 1.5rem; /* Vertical gap between cards in the same column */
  break-inside: avoid; /* Prevents cards from breaking across columns */
  
  .post-header {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743);
    padding: 2px;
    flex-shrink: 0;
  }
  
  .avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .username {
    font-weight: 600;
    font-size: 14px;
    color: #262626;
  }
  
  .post-image img {
    width: 100%;
    height: auto; /* This is key for flexible height */
    display: block; /* Removes bottom space under image */
    transition: opacity 0.3s ease;
  }
  
  &:hover .post-image img {
    opacity: 0.9;
  }
  
  .post-actions {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .action-btn {
    color: #555;
    transition: color 0.2s ease;
    &:hover {
      color: #E1306C;
    }
  }
  
  .likes-count {
    padding: 0 16px 12px;
    font-weight: 600;
    font-size: 14px;
    color: #262626;
  }
`;

// --- MOCK DATA ---
// Using placeholder images with different aspect ratios to demonstrate the masonry layout.
const posts = [
  { id: 1, image: instagramImages[0], avatar: instagramImages[0], likes: 1245, comments: 89 },
  { id: 2, image: instagramImages[1], avatar: instagramImages[1], likes: 987, comments: 67 },
  { id: 3, image: instagramImages[2], avatar: instagramImages[2], likes: 1567, comments: 123 },
  { id: 4, image: instagramImages[3], avatar: instagramImages[3], likes: 834, comments: 45 },
  { id: 5, image: instagramImages[4], avatar: instagramImages[4], likes: 1098, comments: 78 },
  { id: 6, image: instagramImages[5], avatar: instagramImages[5], likes: 756, comments: 34 }
];

// --- MAIN COMPONENT ---
const InstagramFeed = ({ data }) => {
  const displayPosts = data?.posts && data.posts.length > 0 ? data.posts : posts;
  
  return (
    <FeedContainer>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#2C2C2C' }}>
            {data?.title || 'Follow Our Journey'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {data?.subtitle || '@bhuvicreations - Daily fashion inspiration and behind-the-scenes'}
          </Typography>
          <Button
            href={data?.instagramLink || 'https://instagram.com/bhuvicreations'}
            target="_blank"
            startIcon={<Instagram />}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(220, 39, 67, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 20px rgba(220, 39, 67, 0.4)'
              }
            }}
          >
            {data?.buttonText || 'Follow on Instagram'}
          </Button>
        </motion.div>
      
        <MasonryGrid>
          {displayPosts.map((post, index) => (
            <InstagramCard
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
              onClick={() => window.open(data?.instagramLink || 'https://instagram.com/bhuvicreations', '_blank')}
            >
              <div className="post-header">
                <div className="avatar">
                  <img src={post.avatar} alt="Profile Avatar" />
                </div>
                <span className="username">{data?.username || 'bhuvicreations'}</span>
              </div>
            
            <div className="post-image">
              <img src={post.image} alt={`Instagram post ${post.id}`} loading="lazy" />
            </div>
            
            <div className="post-actions">
              <IconButton className="action-btn" size="small">
                <Favorite sx={{ fontSize: '22px' }} />
              </IconButton>
              <IconButton className="action-btn" size="small">
                <ChatBubbleOutline sx={{ fontSize: '22px' }} />
              </IconButton>
            </div>
            
            <div className="likes-count">
              {post.likes.toLocaleString()} likes
            </div>
          </InstagramCard>
        ))}
          </MasonryGrid>
        </Container>
      </FeedContainer>
    );
  };

export default InstagramFeed;
