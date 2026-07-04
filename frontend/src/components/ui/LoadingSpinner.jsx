import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  return (
    <div className={`spinner-wrapper ${className}`}>
      <div className={`spinner spinner-${size}`} role="status" aria-label="Loading" />
    </div>
  );
};

export default LoadingSpinner;
