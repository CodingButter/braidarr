import React, { forwardRef } from 'react';
import { getInputClasses } from './styles';
import type { SelectProps } from './types';

/**
 * Select component with options and error states
 * Follows *arr application design system
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  error,
  label,
  size = 'md',
  onChange,
  className,
  children,
  ...props
}, ref) => {
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={handleChange}
        className={`${getInputClasses(size, !!error, disabled)} ${className || ''}`}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
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
  );
});