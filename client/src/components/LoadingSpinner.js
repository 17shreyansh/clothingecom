import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  type = 'default', 
  size = 'medium', 
  color = '#d4af37',
  text = '',
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="spinner-dots">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="dot"
                style={{ backgroundColor: color }}
                animate={{
                  y: [0, -20, 0],
                  transition: {
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2
                  }
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <motion.div
            className={`spinner-pulse ${sizeClasses[size]}`}
            style={{ backgroundColor: color }}
            variants={pulseVariants}
            animate="animate"
          />
        );
      
      case 'ring':
        return (
          <motion.div
            className={`spinner-ring ${sizeClasses[size]}`}
            style={{ borderTopColor: color }}
            variants={spinnerVariants}
            animate="animate"
          />
        );
      
      default:
        return (
          <motion.div
            className={`spinner-default ${sizeClasses[size]}`}
            style={{ borderTopColor: color }}
            variants={spinnerVariants}
            animate="animate"
          />
        );
    }
  };

  const content = (
    <div className="loading-container">
      {renderSpinner()}
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        className="loading-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default LoadingSpinner;