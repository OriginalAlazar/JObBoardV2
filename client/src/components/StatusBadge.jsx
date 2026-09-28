import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const getStyleClass = () => {
    switch (normalized) {
      case 'OPEN':
        return 'status-open';
      case 'CLOSED':
        return 'status-closed';
      case 'PENDING':
        return 'status-pending';
      case 'REVIEWED':
        return 'status-reviewed';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return 'badge';
    }
  };

  return (
    <span className={`badge ${getStyleClass()}`} aria-label={`Status: ${normalized}`}>
      {normalized}
    </span>
  );
};

export default StatusBadge;
