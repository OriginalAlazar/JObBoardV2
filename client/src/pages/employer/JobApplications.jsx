import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';

const JobApplications = () => {
  const { id } = useParams(); // Job ID
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null); // For viewing full cover letter

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/jobs/${id}/applications`),
      ]);
      setJob(jobRes.data);
      setApplications(appsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidate applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      setError('');
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
      setSuccessMsg(`Candidate application updated to ${newStatus}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading message="Loading candidate applications..." />;

  // Group applications by status for quick summary
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const reviewedCount = applications.filter((a) => a.status === 'REVIEWED').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '20px' }}>
          <Link to="/employer/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
            ← Back to All Postings
          </Link>
        </div>

        {/* Job Header Summary */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{job?.title}</h1>
                <StatusBadge status={job?.status} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                {job?.company} • {job?.location} • ${job?.salary?.toLocaleString()} / year
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge status-pending">{pendingCount} Pending</span>
              <span className="badge status-reviewed">{reviewedCount} In Review</span>
              <span className="badge status-accepted">{acceptedCount} Accepted</span>
              <span className="badge status-rejected">{rejectedCount} Rejected</span>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* Candidate List */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              Candidate Applications ({applications.length})
            </h2>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👥</div>
              <h3>No Applicants Yet</h3>
              <p style={{ maxWidth: '420px', margin: '0 auto' }}>
                No candidate submissions have been received for this position yet. Ensure the posting status is OPEN so job seekers can apply.
              </p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Contact</th>
                    <th>Applied On</th>
                    <th>Resume</th>
                    <th>Current Status</th>
                    <th style={{ textAlign: 'right' }}>Review &amp; Status Transition</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const applicant = app.applicant || {};
                    const isTerminal = app.status === 'ACCEPTED' || app.status === 'REJECTED';
                    const isPending = app.status === 'PENDING';
                    const isReviewed = app.status === 'REVIEWED';

                    return (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{applicant.name || 'Anonymous Applicant'}</div>
                        </td>
                        <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          {applicant.email || '—'}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(app.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
                          <a
                            href={app.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.85rem', textDecoration: 'underline' }}
                          >
                            View Resume ↗
                          </a>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td>
                          <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                              onClick={() => setSelectedCandidate(selectedCandidate?._id === app._id ? null : app)}
                            >
                              {selectedCandidate?._id === app._id ? 'Close Letter' : 'Cover Letter'}
                            </button>

                            {/* BR-005 State Machine Transitions */}
                            {isTerminal ? (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Decision Finalized
                              </span>
                            ) : (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {isPending && (
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--accent-purple)' }}
                                    disabled={updatingId === app._id}
                                    onClick={() => handleStatusChange(app._id, 'REVIEWED')}
                                    title="Mark as reviewed"
                                  >
                                    Review
                                  </button>
                                )}

                                {(isPending || isReviewed) && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      style={{ padding: '4px 10px', fontSize: '0.78rem', background: 'var(--accent-green)' }}
                                      disabled={updatingId === app._id}
                                      onClick={() => handleStatusChange(app._id, 'ACCEPTED')}
                                      title="Accept candidate"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-danger"
                                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                      disabled={updatingId === app._id}
                                      onClick={() => handleStatusChange(app._id, 'REJECTED')}
                                      title="Reject candidate"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Candidate Cover Letter Card */}
        {selectedCandidate && (
          <div className="card" style={{ marginTop: '28px', padding: '24px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                  Candidate Introduction: {selectedCandidate.applicant?.name}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Email: {selectedCandidate.applicant?.email} • Submitted on{' '}
                  {new Date(selectedCandidate.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                COVER LETTER
              </div>
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
                fontSize: '0.92rem',
                color: 'var(--text-secondary)'
              }}>
                {selectedCandidate.coverLetter}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={selectedCandidate.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                Open External Resume ↗
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default JobApplications;
