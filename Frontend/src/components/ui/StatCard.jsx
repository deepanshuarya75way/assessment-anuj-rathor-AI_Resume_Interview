import React from 'react';
import './ui.scss';

export const StatCard = ({
  label,
  value,
  subtext,
  icon,
  trend, // { direction: 'up' | 'down' | 'neutral', label: string }
  accentColor,
  className = '',
}) => {
  return (
    <div className={`prepai-stat-card ${className}`}>
      <div className="prepai-stat-card__header">
        <span className="prepai-stat-card__label">{label}</span>
        {icon && <span className="prepai-stat-card__icon" style={{ color: accentColor }}>{icon}</span>}
      </div>

      <div className="prepai-stat-card__body">
        <span className="prepai-stat-card__value" style={{ color: accentColor }}>{value}</span>
      </div>

      {(subtext || trend) && (
        <div className="prepai-stat-card__footer">
          {trend && (
            <span className={`prepai-stat-card__trend prepai-stat-card__trend--${trend.direction}`}>
              {trend.direction === 'up' ? '↑ ' : trend.direction === 'down' ? '↓ ' : '• '}
              {trend.label}
            </span>
          )}
          {subtext && <span className="prepai-stat-card__subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
