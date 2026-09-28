import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';

const EmployerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/jobs/mine');
      setJobs(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your job postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      setProcessingId(job._id);
      setError('');
      await api.put(`/jobs/${job._id}`, { status: newStatus });
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j))
      );
      setSuccessMsg(`Posting "${job.title}" marked as ${newStatus}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (jobId, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${title}"? All submitted candidate applications for this position will also be removed.`
    );
    if (!confirmed) return;

    try {
      setProcessingId(jobId);
      setError('');
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setSuccessMsg(`Job posting "${title}" deleted.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job posting.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loading message="Loading job postings..." />;

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              Hiring Records
            </span>
            <h1
              style={{
                fontSize: '2.4rem',
                margin: '0 0 6px 0',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                letterSpacing: '-0.02em'
              }}
            >
              My Job Postings
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              Manage open listings, review applicants, toggle status, or edit specifications.
            </p>
          </div>

          <Link to="/employer/jobs/create" className="btn btn-primary">
            Post new role →
          </Link>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
        {successMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{successMsg}</div>}

        {jobs.length === 0 ? (
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              padding: '48px 24px',
              textAlign: 'left'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: '0 0 6px 0', color: 'var(--text)' }}>
              No opportunities posted yet.
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 0 20px 0', fontSize: '0.92rem' }}>
              Create your first job listing to start reaching candidates.
            </p>
            <Link to="/employer/jobs/create" className="btn btn-primary">
              Post a job
            </Link>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              overflowX: 'auto'
            }}
          >
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Title &amp; Location
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Category
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Type
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Compensation
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Candidates
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>{job.title}</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>{job.location}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.88rem' }}>{job.category}</td>
                    <td style={{ padding: '16px', fontSize: '0.88rem' }}>{job.type}</td>
                    <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)', fontSize: '0.88rem' }}>
                      ETB {job.salary?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Link
                        to={`/employer/jobs/${job._id}/applications`}
                        style={{
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                          color: job.applicantCount > 0 ? 'var(--accent)' : 'var(--text-muted)',
                          textDecoration: 'none'
                        }}
                      >
                        {String(job.applicantCount || 0).padStart(2, '0')}
                      </Link>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Link
                          to={`/employer/jobs/${job._id}/applications`}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        >
                          Candidates ({job.applicantCount || 0})
                        </Link>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          disabled={processingId === job._id}
                          onClick={() => handleToggleStatus(job)}
                          title="Toggle posting between OPEN and CLOSED"
                        >
                          {job.status === 'OPEN' ? 'Close' : 'Reopen'}
                        </button>

                        <Link
                          to={`/employer/jobs/${job._id}/edit`}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          disabled={processingId === job._id}
                          onClick={() => handleDelete(job._id, job.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployerJobs;
