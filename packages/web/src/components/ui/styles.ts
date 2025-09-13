import { clsx } from 'clsx';
import type { ButtonVariant, ButtonSize, InputSize, AlertType, BadgeVariant } from './types';

// Button styles based on *arr application design system
export const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 hover:border-gray-400 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600',
  success: 'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 focus:ring-green-500',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600 focus:ring-yellow-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 focus:ring-red-500',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent hover:border-gray-300 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300',
  outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
};

export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm font-medium',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-medium'
};

export const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
};

export const alertTypes = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
};

export const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  primary: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  danger: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
};

// Utility functions for combining classes
export const getButtonClasses = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', disabled?: boolean, loading?: boolean) => {
  return clsx(
    'inline-flex items-center justify-center rounded-md border font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonVariants[variant],
    buttonSizes[size],
    {
      'opacity-50 cursor-not-allowed': disabled || loading,
      'cursor-wait': loading
    }
  );
};

export const getInputClasses = (size: InputSize = 'md', error?: boolean, disabled?: boolean) => {
  return clsx(
    'block w-full rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
    inputSizes[size],
    {
      'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:text-red-400 dark:placeholder-red-400': error,
      'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400': !error,
      'bg-gray-100 dark:bg-gray-800': disabled
    }
  );
};

export const getAlertClasses = (type: AlertType = 'info') => {
  return clsx(
    'rounded-md border p-4',
    alertTypes[type]
  );
};

export const getBadgeClasses = (variant: BadgeVariant = 'default', size: 'sm' | 'md' | 'lg' = 'md', rounded?: boolean) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return clsx(
    'inline-flex items-center font-medium border',
    badgeVariants[variant],
    sizeClasses[size],
    {
      'rounded-full': rounded,
      'rounded': !rounded
    }
  );
};

export const getCardClasses = (padding: 'none' | 'sm' | 'md' | 'lg' = 'md', shadow: 'none' | 'sm' | 'md' | 'lg' = 'sm', hover?: boolean) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return clsx(
    'bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700',
    paddingClasses[padding],
    shadowClasses[shadow],
    {
      'hover:shadow-lg transition-shadow duration-200': hover
    }
  );
};