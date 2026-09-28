import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const getLabel = () => {
    switch (normalized) {
      case 'OPEN':
        return 'Open';
      case 'CLOSED':
        return 'Closed';
      case 'PENDING':
        return 'Pending';
      case 'REVIEWED':
        return 'Reviewed';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  const dotClass = `dot-${normalized.toLowerCase()}`;

  return (
    <span className="status-badge" aria-label={`Status: ${getLabel()}`}>
      <span className={`status-dot ${dotClass}`} aria-hidden="true" />
      <span>{getLabel()}</span>
    </span>
  );
};

export default StatusBadge;
