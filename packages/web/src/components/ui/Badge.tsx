import React from 'react';
import { getBadgeClasses } from './styles';
import type { BadgeProps } from './types';

/**
 * Badge/Tag component with variants and sizes
 * Follows *arr application design system
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  rounded = false,
  className,
  children
}) => {
  return (
    <span className={`${getBadgeClasses(variant, size, rounded)} ${className || ''}`}>
      {children}
    </span>
  );
};

/**
 * Status Badge component for common status indicators
 */
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ status, size = 'md', className }) => {
  const statusConfig = {
    active: { variant: 'success' as const, text: 'Active' },
    inactive: { variant: 'default' as const, text: 'Inactive' },
    pending: { variant: 'warning' as const, text: 'Pending' },
    error: { variant: 'danger' as const, text: 'Error' },
    success: { variant: 'success' as const, text: 'Success' }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.text}
    </Badge>
  );
};

/**
 * Count Badge component for displaying numbers
 */
export const CountBadge: React.FC<{
  count: number;
  max?: number;
  variant?: BadgeProps['variant'];
  size?: BadgeProps['size'];
  className?: string;
}> = ({ count, max = 99, variant = 'primary', size = 'sm', className }) => {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge variant={variant} size={size} rounded className={className}>
      {displayCount}
    </Badge>
  );
};

/**
 * Dot Badge component for simple indicators
 */
export const DotBadge: React.FC<{
  variant?: BadgeProps['variant'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ variant = 'primary', size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const variantClasses = {
    default: 'bg-gray-400',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <span
      className={`inline-block rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`}
      aria-hidden="true"
    />
  );
};

/**
 * Removable Badge component with close button
 */
export const RemovableBadge: React.FC<{
  children: React.ReactNode;
  onRemove: () => void;
  variant?: BadgeProps['variant'];
  size?: BadgeProps['size'];
  className?: string;
}> = ({ children, onRemove, variant = 'default', size = 'md', className }) => {
  return (
    <span className={`${getBadgeClasses(variant, size, false)} inline-flex items-center ${className || ''}`}>
      <span>{children}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-current"
        aria-label="Remove"
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </span>
  );
};