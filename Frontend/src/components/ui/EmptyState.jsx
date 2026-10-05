import React from 'react';
import Button from './Button';
import './ui.scss';

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`prepai-empty-state ${className}`}>
      {icon && <div className="prepai-empty-state__icon">{icon}</div>}
      <h3 className="prepai-empty-state__title">{title}</h3>
      {description && <p className="prepai-empty-state__desc">{description}</p>}
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="prepai-empty-state__actions">
          {actionLabel && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
