import React from 'react';
import { motion } from 'framer-motion';
import { Box, Card, CardContent } from '@mui/material';
import styled from 'styled-components';

const SkeletonBox = styled(motion.div)`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const ProductCardSkeleton = () => (
  <Card sx={{ maxWidth: 345, m: 1 }}>
    <SkeletonBox style={{ height: 280, width: '100%' }} />
    <CardContent>
      <SkeletonBox style={{ height: 24, width: '80%', marginBottom: 12 }} />
      <SkeletonBox style={{ height: 20, width: '60%', marginBottom: 8 }} />
      <SkeletonBox style={{ height: 28, width: '40%' }} />
    </CardContent>
  </Card>
);

const ProductGridSkeleton = ({ count = 8 }) => (
  <Box sx={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: 2,
    p: 2 
  }}>
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <ProductCardSkeleton />
      </motion.div>
    ))}
  </Box>
);

const ProductDetailSkeleton = () => (
  <Box sx={{ display: 'flex', gap: 4, p: 3, maxWidth: 1200, mx: 'auto' }}>
    <Box sx={{ flex: 1 }}>
      <SkeletonBox style={{ height: 500, width: '100%', marginBottom: 16 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} style={{ height: 80, width: 80 }} />
        ))}
      </Box>
    </Box>
    <Box sx={{ flex: 1 }}>
      <SkeletonBox style={{ height: 32, width: '90%', marginBottom: 16 }} />
      <SkeletonBox style={{ height: 24, width: '70%', marginBottom: 12 }} />
      <SkeletonBox style={{ height: 28, width: '50%', marginBottom: 20 }} />
      <SkeletonBox style={{ height: 80, width: '100%', marginBottom: 16 }} />
      <SkeletonBox style={{ height: 48, width: '60%' }} />
    </Box>
  </Box>
);

const CategorySkeleton = () => (
  <Box sx={{ display: 'flex', gap: 2, p: 2, overflowX: 'auto' }}>
    {Array.from({ length: 6 }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
      >
        <Box sx={{ minWidth: 120, textAlign: 'center' }}>
          <SkeletonBox style={{ height: 80, width: 80, borderRadius: '50%', margin: '0 auto 8px' }} />
          <SkeletonBox style={{ height: 16, width: '100%' }} />
        </Box>
      </motion.div>
    ))}
  </Box>
);

export { ProductCardSkeleton, ProductGridSkeleton, ProductDetailSkeleton, CategorySkeleton };