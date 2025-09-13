export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputSize = 'sm' | 'md' | 'lg';
export type AlertType = 'info' | 'success' | 'warning' | 'error';
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface BaseProps {
  className?: string | undefined;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  error?: string;
  label?: string;
  helperText?: string;
}

export interface SelectProps extends BaseProps {
  options: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  size?: InputSize;
  onChange?: (value: string) => void;
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: InputSize;
}

export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

export interface CardProps extends BaseProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export interface AlertProps extends BaseProps {
  type?: AlertType;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: boolean;
}

export interface BadgeProps extends BaseProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export interface LoadingSpinnerProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface SkeletonProps extends BaseProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  lines?: number;
}

export interface FormProps extends BaseProps {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}