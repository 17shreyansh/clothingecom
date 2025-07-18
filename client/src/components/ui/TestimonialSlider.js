import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Avatar, Rating, Chip } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FormatQuote, Verified } from '@mui/icons-material';
import styled from 'styled-components';
import { productImages } from '../../assets';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const TestimonialCard = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff, #fafafa);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.08);
  text-align: center;
  margin: 1rem;
  position: relative;
  border: 1px solid rgba(212,175,55,0.1);
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.12);
  }
  
  .quote-icon {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #D4AF37, #B8941F);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
`;

const SwiperContainer = styled.div`
  .testimonial-swiper {
    .swiper-pagination-bullet {
      background: #D4AF37;
      opacity: 0.3;
    }
    
    .swiper-pagination-bullet-active {
      opacity: 1;
    }
    
    .swiper-button-next,
    .swiper-button-prev {
      color: #D4AF37;
    }
  }
`;

const testimonials = [
  {
    name: 'Priya Sharma',
    rating: 5,
    text: 'Absolutely stunning sarees! The quality is exceptional and the designs are breathtaking. Will definitely order again!',
    avatar: productImages[0],
    location: 'Mumbai',
    verified: true,
    product: 'Silk Saree'
  },
  {
    name: 'Anita Patel',
    rating: 5,
    text: 'Perfect fit kurties with beautiful embroidery. Fast delivery and excellent customer service. Highly recommended!',
    avatar: productImages[1],
    location: 'Delhi',
    verified: true,
    product: 'Designer Kurti'
  },
  {
    name: 'Meera Singh',
    rating: 5,
    text: 'The lehenga was exactly as shown in pictures. Amazing craftsmanship and attention to detail. Perfect for my wedding!',
    avatar: productImages[2],
    location: 'Bangalore',
    verified: true,
    product: 'Bridal Lehenga'
  },
  {
    name: 'Kavya Reddy',
    rating: 5,
    text: 'Beautiful collection and great prices. The fabric quality is outstanding. My go-to store for ethnic wear!',
    avatar: productImages[3],
    location: 'Hyderabad',
    verified: true,
    product: 'Anarkali Suit'
  }
];

const TestimonialSlider = ({ data }) => {
  const displayTestimonials = data?.testimonials && data.testimonials.length > 0 ? data.testimonials : testimonials;
  
  return (
    <Box sx={{ py: 8, background: 'linear-gradient(135deg, #f8f9fa, #ffffff)' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#2C2C2C' }}>
            {data?.title || 'Customer Stories'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            {data?.subtitle || 'Hear from our satisfied customers about their shopping experience'}
          </Typography>
        </motion.div>
      
      <SwiperContainer>
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          autoplay={data?.autoplay !== false ? { delay: data?.autoplaySpeed || 5000, disableOnInteraction: false } : false}
          pagination={{ clickable: true }}
          navigation
          loop
          style={{ paddingBottom: '50px' }}
          className="testimonial-swiper"
        >
        {displayTestimonials.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <TestimonialCard
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="quote-icon">
                <FormatQuote />
              </div>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  fontStyle: 'italic', 
                  lineHeight: 1.7,
                  color: '#555',
                  fontSize: '1.1rem'
                }}
              >
                {testimonial.text}
              </Typography>
              
              <Rating 
                value={testimonial.rating} 
                readOnly 
                sx={{ 
                  mb: 2,
                  '& .MuiRating-iconFilled': {
                    color: '#D4AF37'
                  }
                }} 
              />
              
              <Chip 
                label={testimonial.product}
                size="small"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                  color: 'white',
                  fontWeight: 500
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Avatar 
                  src={testimonial.avatar} 
                  sx={{ 
                    width: 60, 
                    height: 60,
                    border: '3px solid #D4AF37'
                  }} 
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                      {testimonial.name}
                    </Typography>
                    {testimonial.verified && (
                      <Verified sx={{ fontSize: '1rem', color: '#4CAF50' }} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.location}
                  </Typography>
                </Box>
              </Box>
            </TestimonialCard>
          </SwiperSlide>
        ))}
        </Swiper>
      </SwiperContainer>
    </Container>
    </Box>
  );
};

export default TestimonialSlider;