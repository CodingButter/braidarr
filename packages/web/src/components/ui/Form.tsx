import React from 'react';
import type { FormProps } from './types';

/**
 * Form wrapper component with consistent styling
 * Follows *arr application design system
 */
export const Form: React.FC<FormProps> = ({
  onSubmit,
  className,
  children,
  ...props
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 ${className || ''}`}
      noValidate
      {...props}
    >
      {children}
    </form>
  );
};

/**
 * Form Group component for grouping related form fields
 */
export const FormGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`space-y-2 ${className || ''}`}>
    {children}
  </div>
);

/**
 * Form Row component for horizontal layout
 */
export const FormRow: React.FC<{
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}> = ({ children, className, gap = 'md' }) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={`flex flex-wrap ${gapClasses[gap]} ${className || ''}`}>
      {children}
    </div>
  );
};

/**
 * Form Section component for organizing forms into sections
 */
export const FormSection: React.FC<{
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className }) => (
  <div className={`space-y-4 ${className || ''}`}>
    {(title || description) && (
      <div className="space-y-1">
        {title && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

/**
 * Form Actions component for form buttons
 */
export const FormActions: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}> = ({ children, className, align = 'right' }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`flex items-center space-x-3 pt-4 ${alignClasses[align]} ${className || ''}`}>
      {children}
    </div>
  );
};

/**
 * Form Error component for displaying form-level errors
 */
export const FormError: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={`rounded-md bg-red-50 p-4 border border-red-200 dark:bg-red-900/20 dark:border-red-800 ${className || ''}`}
    role="alert"
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-red-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <div className="text-sm text-red-800 dark:text-red-200">
          {children}
        </div>
      </div>
    </div>
  </div>
);