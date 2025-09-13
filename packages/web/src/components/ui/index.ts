// Core UI Components for Braidarr
// Comprehensive component library following *arr application design system

// Button Components
export { Button } from './Button';
export type { ButtonProps } from './types';

// Input Components
export { Input } from './Input';
export { Select } from './Select';
export { Checkbox } from './Checkbox';
export type { InputProps, SelectProps, CheckboxProps } from './types';

// Modal Components
export { Modal } from './Modal';
export type { ModalProps } from './types';

// Card Components
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
export type { CardProps } from './types';

// Loading Components
export { LoadingSpinner } from './LoadingSpinner';
export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from './Skeleton';
export type { LoadingSpinnerProps, SkeletonProps } from './types';

// Alert Components
export { Alert } from './Alert';
export type { AlertProps } from './types';

// Form Components
export { Form, FormGroup, FormRow, FormSection, FormActions, FormError } from './Form';
export type { FormProps } from './types';

// Badge Components
export { Badge, StatusBadge, CountBadge, DotBadge, RemovableBadge } from './Badge';
export type { BadgeProps } from './types';

// Theme Components
export { ThemeProvider, ThemeToggle, useTheme } from './ThemeProvider';

// Types and Utilities
export type {
  BaseProps,
  ButtonVariant,
  ButtonSize,
  InputSize,
  AlertType,
  BadgeVariant
} from './types';

export {
  buttonVariants,
  buttonSizes,
  inputSizes,
  alertTypes,
  badgeVariants,
  getButtonClasses,
  getInputClasses,
  getAlertClasses,
  getBadgeClasses,
  getCardClasses
} from './styles';