import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const JobCard = ({ job }) => {
  if (!job) return null;

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
