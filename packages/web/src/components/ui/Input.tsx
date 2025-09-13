import { forwardRef } from 'react';
import { getInputClasses } from './styles';
import type { InputProps } from './types';

/**
 * Input component with error states and helper text
 * Follows *arr application design system
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  error,
  label,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`${getInputClasses(size, !!error, props.disabled)} ${className || ''}`}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperTextId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={helperTextId}
          className="mt-1 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});