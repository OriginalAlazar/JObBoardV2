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

  if (loading) return <Loading message="Loading your job postings..." />;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>My Job Postings</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Manage open listings, review applicants, toggle status, or edit details.
            </p>
          </div>

          <Link to="/employer/jobs/create" className="btn btn-primary">
            + Post New Job
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {jobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
            <h3>No Postings Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
              You haven't created any job postings yet. Get started by creating your first listing.
            </p>
            <Link to="/employer/jobs/create" className="btn btn-primary">
              Create Job Posting
            </Link>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title &amp; Location</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Candidates</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>{job.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{job.location}</div>
                    </td>
                    <td>{job.category}</td>
                    <td>{job.type}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-green)' }}>
                      ${job.salary?.toLocaleString()}
                    </td>
                    <td>
                      <StatusBadge status={job.status} />
                    </td>
                    <td>
                      <Link
                        to={`/employer/jobs/${job._id}/applications`}
                        style={{
                          fontWeight: 700,
                          color: job.applicantCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        👥 {job.applicantCount || 0}
                      </Link>
                    </td>
                    <td>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
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
                          title={`Toggle posting between OPEN and CLOSED`}
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
