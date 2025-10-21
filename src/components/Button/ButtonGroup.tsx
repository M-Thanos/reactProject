import React from 'react';
import './ButtonGroup.css';

export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  vertical?: boolean;
  fullWidth?: boolean;
}

/**
 * ButtonGroup - مكون لتجميع الأزرار معاً
 * يستخدم لإنشاء مجموعات أزرار متصلة بشكل احترافي
 */
const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  vertical = false,
  fullWidth = false,
}) => {
  const classes = [
    'button-group',
    vertical ? 'button-group-vertical' : 'button-group-horizontal',
    fullWidth ? 'button-group-full-width' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group">
      {children}
    </div>
  );
};

export default ButtonGroup;

