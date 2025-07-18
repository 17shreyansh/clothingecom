import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, TextField, Button, Grid } from '@mui/material';
import { Send, CheckCircle } from '@mui/icons-material';
import styled from 'styled-components';

const CTASection = styled.section`
  background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(184,148,31,0.1));
  padding: 4rem 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 40%;
    height: 200%;
    background: linear-gradient(45deg, rgba(212,175,55,0.1), transparent);
    transform: rotate(15deg);
  }
`;

const NewsletterBox = styled(motion.div)`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  text-align: center;
  position: relative;
  z-index: 2;
`;

const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <CTASection>
      <Container maxWidth="md">
        <NewsletterBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {subscribed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ color: '#4CAF50' }}
            >
              <CheckCircle sx={{ fontSize: '4rem', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Thank You!
              </Typography>
              <Typography variant="body1">
                You've successfully subscribed to our newsletter.
              </Typography>
            </motion.div>
          ) : (
            <>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Stay Updated
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Get exclusive offers, new arrivals, and fashion tips delivered to your inbox
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      endIcon={<Send />}
                      sx={{ py: 1.8, borderRadius: '12px' }}
                    >
                      Subscribe
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                No spam, unsubscribe at any time
              </Typography>
            </>
          )}
        </NewsletterBox>
      </Container>
    </CTASection>
  );
};

export default NewsletterCTA;