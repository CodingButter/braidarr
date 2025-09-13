import { forwardRef } from 'react';
import type { CheckboxProps } from './types';

/**
 * Checkbox component with label and error states
 * Follows *arr application design system
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  size = 'md',
  className,
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${checkboxId}-error` : undefined;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={`${sizeClasses[size]} text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
          aria-invalid={!!error}
          aria-describedby={errorId}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-2 text-sm">
          <label
            htmlFor={checkboxId}
            className={`font-medium text-gray-900 dark:text-gray-300 ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {label}
          </label>
          {error && (
            <p
              id={errorId}
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
});