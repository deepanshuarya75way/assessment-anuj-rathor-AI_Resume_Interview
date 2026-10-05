import React from 'react';
import './ui.scss';

export const Button = React.forwardRef(({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai'
  size = 'md', // 'sm' | 'md' | 'lg'
  iconLeft,
  iconRight,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`prepai-btn prepai-btn--${variant} prepai-btn--${size} ${isLoading ? 'is-loading' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="prepai-btn__spinner" aria-hidden="true" />
      ) : (
        iconLeft && <span className="prepai-btn__icon prepai-btn__icon--left">{iconLeft}</span>
      )}
      <span className="prepai-btn__label">{children}</span>
      {!isLoading && iconRight && (
        <span className="prepai-btn__icon prepai-btn__icon--right">{iconRight}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
