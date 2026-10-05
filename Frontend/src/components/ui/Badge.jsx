import React from 'react';
import './ui.scss';

export const Badge = ({
  children,
  variant = 'neutral', // 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'ai'
  size = 'md', // 'sm' | 'md'
  dot = false,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`prepai-badge prepai-badge--${variant} prepai-badge--${size} ${className}`}
      {...props}
    >
      {dot && <span className="prepai-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Badge;
