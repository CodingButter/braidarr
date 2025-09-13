import React from 'react';
import type { SkeletonProps } from './types';

/**
 * Skeleton component for loading states
 * Follows *arr application design system
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  rounded = false,
  lines = 1,
  className
}) => {
  const getWidth = () => {
    if (typeof width === 'number') return `${width}px`;
    return width;
  };

  const getHeight = () => {
    if (typeof height === 'number') return `${height}px`;
    return height;
  };

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${rounded ? 'rounded-full' : 'rounded'}`}
            style={{
              width: index === lines - 1 ? '75%' : getWidth(),
              height: getHeight()
            }}
            role="status"
            aria-label="Loading content"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${rounded ? 'rounded-full' : 'rounded'} ${className || ''}`}
      style={{
        width: getWidth(),
        height: getHeight()
      }}
      role="status"
      aria-label="Loading content"
    />
  );
};

/**
 * Skeleton variants for common use cases
 */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className
}) => (
  <Skeleton lines={lines} height="0.875rem" className={className} />
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className
}) => {
  const sizes = {
    sm: '32px',
    md: '40px',
    lg: '48px'
  };

  return (
    <Skeleton
      width={sizes[size]}
      height={sizes[size]}
      rounded
      className={className}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`space-y-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700 ${className || ''}`}>
    <Skeleton height="1.5rem" width="60%" />
    <SkeletonText lines={3} />
    <div className="flex space-x-2">
      <Skeleton height="2rem" width="80px" />
      <Skeleton height="2rem" width="80px" />
    </div>
  </div>
);