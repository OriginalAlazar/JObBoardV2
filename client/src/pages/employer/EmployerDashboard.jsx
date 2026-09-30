/**
 * @file EmployerDashboard.jsx
 * @description Central workspace and analytics overview for hiring managers and employers.
 * Aggregates high-level recruitment metrics (active vs. closed positions, candidate pipeline breakdown),
 * lists all organization job postings, and supports expandable inline candidate inspection previews.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';

/**
 * EmployerDashboard Component
 */
const EmployerDashboard = () => {
  const { user } = useAuth();
  // Metrics, job listings, and drawer expansion states
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [expandedCandidates, setExpandedCandidates] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Concurrently fetch employer recruitment statistics and posted job listings
   */
  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        setLoading(true);
        setError('');

        const [statsRes, jobsRes] = await Promise.all([
          api.get('/jobs/stats/employer'),
          api.get('/jobs/mine'),
        ]);

        setStats(statsRes.data);
        setRecentJobs(jobsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load hiring workspace.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, []);

  /**
   * Generates a contextual greeting based on the local time of day
   * @returns {string} 'Good morning', 'Good afternoon', or 'Good evening'
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Formats numbers with zero-padding for aligned editorial typography (e.g. 03)
  const formatNumber = (num) => String(num || 0).padStart(2, '0');

  /**
   * handleToggleExpand
   * Expands an inline candidate drawer for a selected job posting, lazily fetching candidates if not cached
   * 
   * @param {string} jobId - Selected job ID to expand/collapse
   */
  const handleToggleExpand = async (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }

    setExpandedJobId(jobId);

    // If candidates not yet loaded for this job, fetch inline
    if (!expandedCandidates[jobId]) {
      try {
        setLoadingCandidates(true);
        const res = await api.get(`/jobs/${jobId}/applications`);
        setExpandedCandidates((prev) => ({ ...prev, [jobId]: res.data || [] }));
      } catch {
        setExpandedCandidates((prev) => ({ ...prev, [jobId]: [] }));
      } finally {
        setLoadingCandidates(false);
      }
    }
  };

  if (loading) return <Loading message="Loading hiring workspace..." />;


  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        
        {/* Editorial Greeting Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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
                Hiring Workspace · {user?.company || 'Organization'}
              </span>
              <h1
                style={{
                  fontSize: '2.5rem',
                  margin: '0 0 6px 0',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15
                }}
              >
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Employer'}
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.98rem' }}>
                Here's what's happening with your hiring activity.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/employer/jobs" className="btn btn-secondary">
                Manage all postings
              </Link>
              <Link to="/employer/jobs/create" className="btn btn-primary">
                Post new role →
              </Link>
            </div>
          </div>

          {/* Editorial Pipeline Summary */}
          {stats && (
            <div
              style={{
                marginTop: '32px',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                padding: '24px 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '24px'
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}
                >
                  ACTIVE JOBS
                </span>
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text)'
                  }}
                >
                  {formatNumber(stats.openJobs)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  of {stats.totalJobs} total
                </span>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}
                >
                  APPLICATIONS
                </span>
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text)'
                  }}
                >
                  {formatNumber(stats.totalApplicants)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  across all roles
                </span>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}
                >
                  AWAITING REVIEW
                </span>
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)'
                  }}
                >
                  {formatNumber(stats.pending)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  require decision
                </span>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}
                >
                  ACCEPTED OFFERS
                </span>
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)'
                  }}
                >
                  {formatNumber(stats.accepted)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  {stats.reviewed} under review
                </span>
              </div>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '24px' }}>{error}</div>}

        {/* Operational Directory of Active Positions */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            padding: '32px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2
              style={{
                fontSize: '1.4rem',
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontWeight: 600
              }}
            >
              Recent Postings &amp; Candidates
            </h2>
            <Link
              to="/employer/jobs"
              style={{
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              All postings ({recentJobs.length}) →
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div style={{ textAlign: 'left', padding: '32px 0', color: 'var(--text-muted)' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: '0 0 6px 0', color: 'var(--text)' }}>
                No opportunities posted yet.
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem' }}>
                Create your first job listing to start reaching candidates.
              </p>
              <Link to="/employer/jobs/create" className="btn btn-primary">
                Post a job
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentJobs.map((job) => {
                const isExpanded = expandedJobId === job._id;
                const candidates = expandedCandidates[job._id] || [];

                return (
                  <div
                    key={job._id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      padding: '20px 0'
                    }}
                  >
                    {/* Row Item */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h3
                            style={{
                              fontSize: '1.15rem',
                              margin: 0,
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 600
                            }}
                          >
                            {job.title}
                          </h3>
                          <StatusBadge status={job.status} />
                        </div>
                        <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {job.location} · {job.type} · {job.category} ·{' '}
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              color: 'var(--accent)'
                            }}
                          >
                            ETB {job.salary?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                          onClick={() => handleToggleExpand(job._id)}
                        >
                          {isExpanded ? 'Hide Candidates' : `Candidates (${job.applicantCount || 0})`}
                        </button>

                        <Link
                          to={`/employer/jobs/${job._id}/applications`}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          Full Board →
                        </Link>
                      </div>
                    </div>

                    {/* Inline Review Drawer */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '16px',
                          padding: '20px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                            Applicants for {job.title}
                          </strong>
                          <Link
                            to={`/employer/jobs/${job._id}/applications`}
                            style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}
                          >
                            Open Decision Board →
                          </Link>
                        </div>

                        {loadingCandidates ? (
                          <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            Loading submissions...
                          </div>
                        ) : candidates.length === 0 ? (
                          <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            No candidates have applied for this position yet.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {candidates.map((cand) => (
                              <div
                                key={cand._id}
                                style={{
                                  background: 'var(--surface)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '12px 16px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '12px'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                                    {cand.applicant?.name || 'Applicant'}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {cand.applicant?.email} · Applied {new Date(cand.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <a
                                    href={cand.resumeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'underline' }}
                                  >
                                    Resume →
                                  </a>
                                  <StatusBadge status={cand.status} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmployerDashboard;
