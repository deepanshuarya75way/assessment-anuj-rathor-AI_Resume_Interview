import React from 'react';
import './ui.scss';

export const Skeleton = ({
  variant = 'text', // 'text' | 'rect' | 'circle'
  width,
  height,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`prepai-skeleton prepai-skeleton--${variant} ${className}`}
      style={{
        width: width || (variant === 'circle' ? 40 : '100%'),
        height: height || (variant === 'text' ? 16 : variant === 'circle' ? 40 : 80),
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
