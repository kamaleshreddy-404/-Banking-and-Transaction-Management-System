import React from 'react';

const LoadingSkeleton = ({ count = 3, height = '40px', className = '' }) => {
  return (
    <div className={`skeleton-wrapper ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="skeleton-pulse" 
          style={{ height, marginBottom: '0.75rem', borderRadius: 'var(--radius-md)' }} 
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
