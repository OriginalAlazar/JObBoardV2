/**
 * @file JobCard.jsx
 * @description Presentational job row list component.
 * Renders an accessible, interactive table-like row displaying job title, hiring organization,
 * location, employment type, category, formatted Ethiopian Birr (ETB) salary, and vacancy status.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

/**
 * JobCard Component
 * 
 * @param {object} props - Component props
 * @param {object} props.job - Job document object from the backend
 */
const JobCard = ({ job }) => {
  // Gracefully handle undefined or null job items
  if (!job) return null;

  // Format numerical salary into standard Ethiopian Birr locale string (e.g., 'ETB 35,000')
  const formattedSalary = job.salary
    ? `ETB ${Number(job.salary).toLocaleString()}`
    : null;

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="job-row"
      id={`job-row-${job._id}`}
      aria-label={`${job.title} at ${job.company}, ${job.location}`}
    >
      {/* Main Column: Title, Company, Location, Type, Category, and Compensation */}
      <div className="job-row-main">
        <div className="job-row-header">
          <span className="job-row-title">{job.title}</span>
          <span className="job-row-company">{job.company}</span>
        </div>

        <div className="job-row-meta">
          <span>{job.location}</span>
          <span className="meta-separator">·</span>
          <span>{job.type}</span>
          <span className="meta-separator">·</span>
          <span>{job.category}</span>
          {formattedSalary && (
            <>
              <span className="meta-separator">·</span>
              <span className="font-mono" style={{ color: 'var(--text)' }}>
                {formattedSalary}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action / Status Column: Open/Closed status badge & direction arrow */}
      <div className="job-row-action">
        <StatusBadge status={job.status} />
        <span className="job-row-arrow" aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );
};

export default JobCard;

