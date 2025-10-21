import React from 'react';
import './IconButton.css';

export type IconButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'success'
  | 'warning';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  icon: React.ReactNode;
  rounded?: boolean;
}

/**
 * IconButton - زر للأيقونات فقط
 * مثالي للأدوات والإجراءات السريعة
 */
const IconButton: React.FC<IconButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  rounded = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'icon-btn-base';
  
  const variantClasses: Record<IconButtonVariant, string> = {
    primary: 'icon-btn-primary',
    secondary: 'icon-btn-secondary',
    outline: 'icon-btn-outline',
    ghost: 'icon-btn-ghost',
    danger: 'icon-btn-danger',
    success: 'icon-btn-success',
    warning: 'icon-btn-warning',
  };

  const sizeClasses: Record<IconButtonSize, string> = {
    sm: 'icon-btn-sm',
    md: 'icon-btn-md',
    lg: 'icon-btn-lg',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    rounded ? 'icon-btn-rounded' : '',
    loading ? 'icon-btn-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="icon-btn-spinner" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
    </button>
  );
};

export default IconButton;

