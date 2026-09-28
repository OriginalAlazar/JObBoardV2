import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';

const JobApplications = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const reviewedCount = applications.filter((a) => a.status === 'REVIEWED').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            to="/employer/jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}
          >
            ← Back to All Postings
          </Link>
        </div>

        {/* Job Header Summary */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            padding: '28px',
            marginBottom: '32px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1
                  style={{
                    fontSize: '1.85rem',
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {job?.title}
                </h1>
                <StatusBadge status={job?.status} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                {job?.company} · {job?.location} ·{' '}
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                  ETB {job?.salary?.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge status-pending">
                <span className="status-dot dot-pending" /> {pendingCount} Pending
              </span>
              <span className="badge status-reviewed">
                <span className="status-dot dot-reviewed" /> {reviewedCount} In Review
              </span>
              <span className="badge status-accepted">
                <span className="status-dot dot-accepted" /> {acceptedCount} Accepted
              </span>
              <span className="badge status-rejected">
                <span className="status-dot dot-rejected" /> {rejectedCount} Rejected
              </span>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
        {successMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{successMsg}</div>}

        {/* Candidate List */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            padding: '28px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              Candidate Applications ({applications.length})
            </h2>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'left', padding: '32px 0', color: 'var(--text-muted)' }}>
              <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', margin: '0 0 8px 0' }}>
                No applicants yet
              </h3>
              <p style={{ maxWidth: '440px', margin: 0, fontSize: '0.92rem' }}>
                No candidate submissions have been received for this position yet. Ensure the posting status is OPEN so candidates can apply.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Candidate
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Contact
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Applied
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Resume
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', textAlign: 'right' }}>
                      Status Transition
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const applicant = app.applicant || {};
                    const isTerminal = app.status === 'ACCEPTED' || app.status === 'REJECTED';
                    const isPending = app.status === 'PENDING';
                    const isReviewed = app.status === 'REVIEWED';

                    return (
                      <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)' }}>
                            {applicant.name || 'Candidate'}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                          {applicant.email || '—'}
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.86rem', fontFamily: 'var(--font-mono)' }}>
                          {new Date(app.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <a
                            href={app.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.86rem', textDecoration: 'underline' }}
                          >
                            View Resume →
                          </a>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <StatusBadge status={app.status} />
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                              onClick={() => setSelectedCandidate(selectedCandidate?._id === app._id ? null : app)}
                            >
                              {selectedCandidate?._id === app._id ? 'Close' : 'Cover Letter'}
                            </button>

                            {/* BR-005 State Machine Transitions */}
                            {isTerminal ? (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                                Finalized
                              </span>
                            ) : (
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                {isPending && (
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
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
                                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
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

        {/* Selected Candidate Cover Letter Drawer */}
        {selectedCandidate && (
          <div
            style={{
              marginTop: '32px',
              padding: '24px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Candidate Submission Detail
                </span>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
                  {selectedCandidate.applicant?.name}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                  Email: {selectedCandidate.applicant?.email} · Submitted on{' '}
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
                style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px' }}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Cover Letter / Candidate Statement
              </div>
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.6,
                  fontSize: '0.9rem',
                  color: 'var(--text)'
                }}
              >
                {selectedCandidate.coverLetter}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a
                href={selectedCandidate.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.84rem', padding: '8px 14px' }}
              >
                Open External Resume →
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default JobApplications;
