import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Success Notification Component
 * 
 * Features:
 * - Auto-dismiss
 * - Progress bar
 * - Action button
 * - Multiple variants
 */
const SuccessNotification = ({
  message = 'Success!',
  onClose,
  onAction,
  actionLabel = 'Undo',
  autoDismiss = true,
  dismissTime = 4000,
  variant = 'default',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!autoDismiss || !isVisible) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.max(0, 100 - (elapsed / dismissTime) * 100);
      setProgress(newProgress);

      if (newProgress <= 0) {
        setIsVisible(false);
        onClose?.();
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [autoDismiss, dismissTime, isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleAction = () => {
    setIsVisible(false);
    onAction?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        notification
        notification--success
        notification--${variant}
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Content */}
      <div className="notification__content">
        <span className="notification__icon" aria-hidden="true">
          ✓
        </span>
        <span className="notification__message">{message}</span>
      </div>

      {/* Actions */}
      <div className="notification__actions">
        {onAction && (
          <button
            className="notification__button notification__button--action"
            onClick={handleAction}
            type="button"
          >
            {actionLabel}
          </button>
        )}
        <button
          className="notification__button notification__button--close"
          onClick={handleClose}
          type="button"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Progress Bar */}
      {autoDismiss && (
        <div
          className="notification__progress"
          style={{
            width: `${progress}%`,
          }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      )}
    </div>
  );
};

SuccessNotification.propTypes = {
  message: PropTypes.string,
  onClose: PropTypes.func,
  onAction: PropTypes.func,
  actionLabel: PropTypes.string,
  autoDismiss: PropTypes.bool,
  dismissTime: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'compact', 'inline']),
  className: PropTypes.string,
};

export default SuccessNotification;
