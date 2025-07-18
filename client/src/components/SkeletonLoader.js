import React from 'react';
import { motion } from 'framer-motion';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'product', count = 1, className = '' }) => {
  const shimmerVariants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const SkeletonItem = ({ children }) => (
    <div className={`skeleton-item ${className}`}>
      <motion.div
        className="skeleton-shimmer"
        variants={shimmerVariants}
        animate="animate"
      />
      {children}
    </div>
  );

  const ProductCardSkeleton = () => (
    <div className="skeleton-product-card">
      <SkeletonItem>
        <div className="skeleton-image" />
      </SkeletonItem>
      <div className="skeleton-content">
        <SkeletonItem>
          <div className="skeleton-title" />
        </SkeletonItem>
        <SkeletonItem>
          <div className="skeleton-price" />
        </SkeletonItem>
        <SkeletonItem>
          <div className="skeleton-rating" />
        </SkeletonItem>
      </div>
    </div>
  );

  const ProductDetailSkeleton = () => (
    <div className="skeleton-product-detail">
      <div className="skeleton-images">
        <SkeletonItem>
          <div className="skeleton-main-image" />
        </SkeletonItem>
        <div className="skeleton-thumbnails">
          {[...Array(4)].map((_, i) => (
            <SkeletonItem key={i}>
              <div className="skeleton-thumbnail" />
            </SkeletonItem>
          ))}
        </div>
      </div>
      <div className="skeleton-info">
        <SkeletonItem>
          <div className="skeleton-title-large" />
        </SkeletonItem>
        <SkeletonItem>
          <div className="skeleton-price-large" />
        </SkeletonItem>
        <SkeletonItem>
          <div className="skeleton-description" />
        </SkeletonItem>
        <SkeletonItem>
          <div className="skeleton-button" />
        </SkeletonItem>
      </div>
    </div>
  );

  const CartItemSkeleton = () => (
    <div className="skeleton-cart-item">
      <SkeletonItem>
        <div className="skeleton-cart-image" />
      </SkeletonItem>
      <div className="skeleton-cart-content">
        <SkeletonItem>
          <div className="skeleton-cart-title" />
        </SkeletonItem>
        <SkeletonItem>
          <div className="skeleton-cart-price" />
        </SkeletonItem>
      </div>
    </div>
  );

  const TextSkeleton = ({ lines = 3 }) => (
    <div className="skeleton-text">
      {[...Array(lines)].map((_, i) => (
        <SkeletonItem key={i}>
          <div 
            className="skeleton-line" 
            style={{ width: i === lines - 1 ? '70%' : '100%' }}
          />
        </SkeletonItem>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'product':
        return [...Array(count)].map((_, i) => <ProductCardSkeleton key={i} />);
      case 'product-detail':
        return <ProductDetailSkeleton />;
      case 'cart-item':
        return [...Array(count)].map((_, i) => <CartItemSkeleton key={i} />);
      case 'text':
        return <TextSkeleton lines={count} />;
      default:
        return [...Array(count)].map((_, i) => <ProductCardSkeleton key={i} />);
    }
  };

  return <div className="skeleton-container">{renderSkeleton()}</div>;
};

export default SkeletonLoader;