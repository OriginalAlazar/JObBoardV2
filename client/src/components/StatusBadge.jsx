/**
 * @file StatusBadge.jsx
 * @description Visual status indicator badge with color-coded dot.
 * Normalizes and formats status labels for both Job Postings (OPEN, CLOSED)
 * and Candidate Applications (PENDING, REVIEWED, ACCEPTED, REJECTED) with accessible ARIA labels.
 */

import React from 'react';

/**
 * StatusBadge Component
 * 
 * @param {object} props - Component props
 * @param {string} props.status - The raw status string from the backend
 */
const StatusBadge = ({ status }) => {
  // If status is undefined or null, render nothing
  if (!status) return null;

  // Normalize to uppercase for reliable switch comparisons
  const normalized = status.toUpperCase();

  /**
   * Translates uppercase machine keys to human-readable capitalized labels
   */
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

  // Maps status to corresponding CSS styling class (e.g. dot-open, dot-pending, dot-accepted)
  const dotClass = `dot-${normalized.toLowerCase()}`;

  return (
    <span className="status-badge" aria-label={`Status: ${getLabel()}`}>
      <span className={`status-dot ${dotClass}`} aria-hidden="true" />
      <span>{getLabel()}</span>
    </span>
  );
};

export default StatusBadge;

