import React from 'react';

const statusClassMap = {
  ACTIVE: 'badge-success',
  COMPLETED: 'badge-success',
  OPEN: 'badge-success',
  IN_PROGRESS: 'badge-primary',
  PENDING: 'badge-warning',
  FROZEN: 'badge-warning',
  MEDIUM: 'badge-warning',
  CLOSED: 'badge-neutral',
  RESOLVED: 'badge-neutral',
  LOW: 'badge-neutral',
  FAILED: 'badge-danger',
  BLOCKED: 'badge-danger',
  REVERSED: 'badge-danger',
  CRITICAL: 'badge-danger',
  HIGH: 'badge-danger',
  SAVINGS: 'badge-primary',
  CURRENT: 'badge-info',
  CREDIT: 'badge-success',
  DEBIT: 'badge-danger'
};

const Badge = ({ children, status, className = '' }) => {
  const normalized = (status || children || '').toString().toUpperCase();
  const colorClass = statusClassMap[normalized] || 'badge-neutral';

  return (
    <span className={`badge ${colorClass} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;
