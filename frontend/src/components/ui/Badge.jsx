import React from 'react';

/**
 * Badge component for status indicators
 * @param {'success'|'warning'|'danger'|'info'|'accent'|'purple'} variant
 * @param {boolean} dot - show colored dot
 */
const Badge = ({ children, variant = 'accent', dot = true, className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
};

// Utility: map payroll status → badge variant
export const statusVariant = (status) => {
  switch (status) {
    case 'Paid': return 'success';
    case 'Pending': return 'warning';
    case 'Processing': return 'info';
    default: return 'accent';
  }
};

export default Badge;
