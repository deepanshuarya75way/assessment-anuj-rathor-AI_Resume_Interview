import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading State Component
 * 
 * Features:
 * - Multiple loading variants (spinner, skeleton, pulse)
 * - Progress indicator
 * - Custom loading message
 * - Accessibility support
 */
const LoadingState = ({
  isLoading = true,
  variant = 'spinner',
  message = 'Loading...',
  progress,
  fullScreen = false,
  overlay = false,
  children,
  className = '',
}) => {
  if (!isLoading) return children || null;

  return (
    <div
      className={`
        loading-state
        loading-state--${variant}
        ${fullScreen ? 'loading-state--fullscreen' : ''}
        ${overlay ? 'loading-state--overlay' : ''}
        ${className}
      `}
      role="status"
      aria-label={message}
      aria-live="polite"
    >
      {/* Spinner Variant */}
      {variant === 'spinner' && (
        <div className="loading-state__spinner">
          <div className="spinner"></div>
          {message && <p className="loading-state__message">{message}</p>}
        </div>
      )}

      {/* Pulse Variant */}
      {variant === 'pulse' && (
        <div className="loading-state__pulse">
          <div className="pulse"></div>
          {message && <p className="loading-state__message">{message}</p>}
        </div>
      )}

      {/* Skeleton Variant */}
      {variant === 'skeleton' && (
        <div className="loading-state__skeleton">
          <div className="skeleton skeleton--line"></div>
          <div className="skeleton skeleton--line"></div>
          <div className="skeleton skeleton--line skeleton--short"></div>
          {message && <p className="loading-state__message">{message}</p>}
        </div>
      )}

      {/* Progress Variant */}
      {variant === 'progress' && (
        <div className="loading-state__progress">
          <div className="progress">
            <div
              className="progress__bar"
              style={{
                width: `${Math.min(progress || 0, 100)}%`,
              }}
              role="progressbar"
              aria-valuenow={progress || 0}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          {message && <p className="loading-state__message">{message}</p>}
          {progress !== undefined && (
            <small className="loading-state__percent">{progress}%</small>
          )}
        </div>
      )}

      {/* Dots Variant */}
      {variant === 'dots' && (
        <div className="loading-state__dots">
          <div className="dot dot--1"></div>
          <div className="dot dot--2"></div>
          <div className="dot dot--3"></div>
          {message && <p className="loading-state__message">{message}</p>}
        </div>
      )}
    </div>
  );
};

LoadingState.propTypes = {
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(['spinner', 'pulse', 'skeleton', 'progress', 'dots']),
  message: PropTypes.string,
  progress: PropTypes.number,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default LoadingState;
