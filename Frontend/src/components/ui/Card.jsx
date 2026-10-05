import React from 'react';
import './ui.scss';

export const Card = ({
  children,
  variant = 'default', // 'default' | 'elevated' | 'glass' | 'interactive' | 'accent'
  padding = 'md', // 'none' | 'sm' | 'md' | 'lg'
  className = '',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`prepai-card prepai-card--${variant} prepai-card--p-${padding} ${onClick ? 'prepai-card--clickable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
