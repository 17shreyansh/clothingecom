import React from 'react';

const SafeText = ({ children, fallback = '' }) => {
  if (typeof children === 'string' || typeof children === 'number') {
    return children;
  }
  
  if (children && typeof children === 'object') {
    if (children.name) return children.name;
    if (children.title) return children.title;
    if (children.label) return children.label;
    return fallback;
  }
  
  return fallback;
};

export default SafeText;