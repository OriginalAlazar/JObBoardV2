import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [expandedCandidates, setExpandedCandidates] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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

  if (loading) return <Loading message="Loading recruitment workspace..." />;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Editorial Greeting Header */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Hiring Workspace • {user?.company || 'Organization'}
              </span>
              <h1 style={{ fontSize: '2.4rem', margin: '4px 0 6px', lineHeight: 1.15 }}>
                {getGreeting()}, {user?.name}
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>
                Operational recruitment pipeline, open listings, and applicant review.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/employer/jobs" className="btn btn-secondary">
                Manage All Postings
              </Link>
              <Link to="/employer/jobs/create" className="btn btn-primary">
                + Post New Role
              </Link>
            </div>
          </div>

          {/* Editorial Pipeline Summary (Avoiding generic 3-card cliché) */}
          {stats && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '36px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.92rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Openings
                </span>
                <span style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {stats.openJobs}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  of {stats.totalJobs} total
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Applicants
                </span>
                <span style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                  {stats.totalApplicants}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  across active roles
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pending Evaluation
                </span>
                <span style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                  {stats.pending}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  require first pass
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Accepted Offers
                </span>
                <span style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                  {stats.accepted}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  {stats.reviewed} under review
                </span>
              </div>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Operational Directory of Active Positions with Inline Review Expansion */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Active Job Postings &amp; Candidates</h2>
            <Link to="/employer/jobs" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}>
              All Postings ({recentJobs.length}) →
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💼</div>
              <h3>No Active Roles</h3>
              <p style={{ maxWidth: '420px', margin: '0 auto 20px' }}>
                You have no active job postings. Publish an opening to begin receiving verified applications.
              </p>
              <Link to="/employer/jobs/create" className="btn btn-primary">
                Create First Opening
              </Link>
            </div>
          ) : (
            <div className="job-directory">
              {recentJobs.map((job) => {
                const isExpanded = expandedJobId === job._id;
                const candidates = expandedCandidates[job._id] || [];

                return (
                  <div key={job._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* Row Item */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 24px',
                      background: isExpanded ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                      transition: 'background var(--motion-fast)'
                    }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-serif)' }}>
                            {job.title}
                          </h3>
                          <StatusBadge status={job.status} />
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          📍 {job.location} • 💼 {job.type} • 🏷️ {job.category} • <span style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${job.salary?.toLocaleString()}/yr</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600 }}
                          onClick={() => handleToggleExpand(job._id)}
                        >
                          {isExpanded ? 'Hide Candidates ▲' : `Review Candidates (${job.applicantCount || 0}) ▼`}
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

                    {/* Inline Review Drawer (Micro-interaction without leaving page) */}
                    {isExpanded && (
                      <div style={{
                        padding: '24px',
                        background: 'var(--bg-surface-elevated)',
                        borderTop: '1px solid var(--border-subtle)',
                        animation: 'modalIn var(--motion-fast)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                            Direct Applicant Submissions for {job.title}
                          </strong>
                          <Link to={`/employer/jobs/${job._id}/applications`} style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                            Open Dedicated Decision Board ↗
                          </Link>
                        </div>

                        {loadingCandidates ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Loading applicant submissions...
                          </div>
                        ) : candidates.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No candidates have applied for this position yet.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {candidates.map((cand) => (
                              <div
                                key={cand._id}
                                style={{
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '14px 18px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '12px'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                                    {cand.applicant?.name || 'Applicant'}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {cand.applicant?.email} • Applied {new Date(cand.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <a
                                    href={cand.resumeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'underline' }}
                                  >
                                    Resume ↗
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
