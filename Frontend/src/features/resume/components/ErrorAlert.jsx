import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Error Alert Component
 * 
 * Features:
 * - Multiple error types (error, warning, info, success)
 * - Auto-dismiss option
 * - Retry button
 * - Detailed error message
 * - Accessibility support
 */
const ErrorAlert = ({
  error,
  onClose,
  onRetry,
  autoDismiss = true,
  dismissTime = 5000,
  variant = 'error',
  showDetails = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(!!error);
  const [showDetailedError, setShowDetailedError] = useState(false);

  useEffect(() => {
    setIsVisible(!!error);
    setShowDetailedError(false);
  }, [error]);

  useEffect(() => {
    if (!isVisible || !autoDismiss || !error) return;

    const timer = setTimeout(() => {
      handleClose();
    }, dismissTime);

    return () => clearTimeout(timer);
  }, [isVisible, autoDismiss, dismissTime, error]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleRetry = () => {
    setIsVisible(false);
    onRetry?.();
  };

  if (!isVisible || !error) return null;

  // Extract error message
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || 'An unexpected error occurred';

  const errorCode = error?.code || error?.errorCode;
  const errorDetails = error?.details || error?.originalError?.message;

  // Icon and color based on variant
  const variantConfig = {
    error: {
      icon: '⚠️',
      color: 'error',
      title: 'Error',
    },
    warning: {
      icon: '⚡',
      color: 'warning',
      title: 'Warning',
    },
    info: {
      icon: 'ℹ️',
      color: 'info',
      title: 'Info',
    },
    success: {
      icon: '✓',
      color: 'success',
      title: 'Success',
    },
  };

  const config = variantConfig[variant] || variantConfig.error;

  return (
    <div
      className={`
        alert
        alert--${config.color}
        ${className}
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="alert__content">
        {/* Icon and Message */}
        <div className="alert__main">
          <span className="alert__icon" aria-hidden="true">
            {config.icon}
          </span>
          <div className="alert__message">
            <h4 className="alert__title">
              {config.title}
            </h4>
            <p className="alert__text">
              {errorMessage}
            </p>

            {/* Error Code */}
            {errorCode && (
              <small className="alert__code">
                Code: {errorCode}
              </small>
            )}

            {/* Detailed Error */}
            {errorDetails && (
              <button
                className="alert__details-toggle"
                onClick={() => setShowDetailedError(!showDetailedError)}
                type="button"
                aria-expanded={showDetailedError}
              >
                {showDetailedError ? 'Hide' : 'Show'} Details
              </button>
            )}

            {showDetailedError && errorDetails && (
              <pre className="alert__details">
                {errorDetails}
              </pre>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="alert__actions">
          {onRetry && (
            <button
              className="alert__button alert__button--retry"
              onClick={handleRetry}
              type="button"
            >
              Retry
            </button>
          )}
          <button
            className="alert__button alert__button--close"
            onClick={handleClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

ErrorAlert.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      code: PropTypes.string,
      errorCode: PropTypes.string,
      details: PropTypes.string,
      originalError: PropTypes.shape({
        message: PropTypes.string,
      }),
    }),
  ]),
  onClose: PropTypes.func,
  onRetry: PropTypes.func,
  autoDismiss: PropTypes.bool,
  dismissTime: PropTypes.number,
  variant: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  showDetails: PropTypes.bool,
  className: PropTypes.string,
};

export default ErrorAlert;
