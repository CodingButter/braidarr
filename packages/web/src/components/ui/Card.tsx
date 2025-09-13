import React from 'react';
import { getCardClasses } from './styles';
import type { CardProps } from './types';

/**
 * Card component for content sections
 * Follows *arr application design system
 */
export const Card: React.FC<CardProps> = ({
  header,
  footer,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  className,
  children
}) => {
  return (
    <div className={`${getCardClasses(padding, shadow, hover)} ${className || ''}`}>
      {header && (
        <div className={`border-b border-gray-200 dark:border-gray-700 ${padding !== 'none' ? '-mx-4 -mt-4 px-4 py-3 mb-4' : 'pb-3 mb-3'}`}>
          {header}
        </div>
      )}
      
      <div className={padding === 'none' ? '' : ''}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-gray-200 dark:border-gray-700 ${padding !== 'none' ? '-mx-4 -mb-4 px-4 py-3 mt-4' : 'pt-3 mt-3'}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Card Header component for consistent header styling
 */
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={`flex items-center justify-between ${className || ''}`}>
    {children}
  </div>
);

/**
 * Card Title component for consistent title styling
 */
export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className || ''}`}>
    {children}
  </h3>
);

/**
 * Card Content component for main content area
 */
export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={`text-gray-700 dark:text-gray-300 ${className || ''}`}>
    {children}
  </div>
);

/**
 * Card Footer component for consistent footer styling
 */
export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={`flex items-center justify-end space-x-2 ${className || ''}`}>
    {children}
  </div>
);