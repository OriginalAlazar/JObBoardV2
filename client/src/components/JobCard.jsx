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
    year: 'numeric',
  });

  return (
    <Link to={`/jobs/${job._id}`} className="job-card" id={`job-card-${job._id}`}>
      <div>
        <div className="job-card-header">
          <div>
            <h3 className="job-card-title">{job.title}</h3>
            <div className="job-card-company">{job.company}</div>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <p className="job-desc-snippet">{job.description}</p>

        <div className="job-meta-row">
          <span className="job-tag">📍 {job.location}</span>
          <span className="job-tag">💼 {job.type}</span>
          <span className="job-tag">🏷️ {job.category}</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: '12px'
      }}>
        <span className="salary-tag">{formattedSalary} <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>/ year</small></span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
      </div>
    </Link>
  );
};

export default JobCard;
