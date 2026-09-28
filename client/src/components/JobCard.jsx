import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const JobCard = ({ job }) => {
  if (!job) return null;

  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(job.salary || 0);

  const formattedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="job-directory-row"
      id={`job-row-${job._id}`}
      aria-label={`${job.title} at ${job.company}, ${job.location}`}
    >
      <div className="row-main">
        <h3 className="row-title">{job.title}</h3>
        <div className="row-company">{job.company}</div>

        <div className="row-meta">
          <span className="row-meta-item">📍 {job.location}</span>
          <span className="row-meta-item">💼 {job.type}</span>
          <span className="row-meta-item">🏷️ {job.category}</span>
          <span className="row-salary">💰 {formattedSalary}</span>
          <span className="row-meta-item" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Posted {formattedDate}
          </span>
        </div>
      </div>

      <div className="row-action">
        <StatusBadge status={job.status} />
        <span className="row-arrow" aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );
};

export default JobCard;
