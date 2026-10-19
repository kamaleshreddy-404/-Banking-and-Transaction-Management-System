import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', change, isPositive }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className={`stat-icon-wrapper icon-${color}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {(subtitle || change) && (
        <div className="stat-footer">
          {change && (
            <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </span>
          )}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
