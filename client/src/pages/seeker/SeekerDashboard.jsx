import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const [statsRes, appsRes] = await Promise.all([
          api.get('/applications/stats/seeker'),
          api.get('/applications/me'),
        ]);

        setStats(statsRes.data);
        setRecentApplications(appsRes.data.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load career workspace.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Loading career workspace..." />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatNumber = (num) => String(num || 0).padStart(2, '0');

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
                Candidate Workspace
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
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Applicant'}
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.98rem' }}>
                Your active applications and real-time review progression.
              </p>
            </div>

            <Link to="/jobs" className="btn btn-primary">
              Explore opportunities →
            </Link>
          </div>

          {/* Editorial Workspace Stats List */}
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
                  ACTIVE APPLICATIONS
                </span>
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text)'
                  }}
                >
                  {formatNumber(stats.totalApplications)}
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
                    color: 'var(--text)'
                  }}
                >
                  {formatNumber(stats.pending)}
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
                  UNDER EVALUATION
                </span>
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text)'
                  }}
                >
                  {formatNumber(stats.reviewed)}
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
                  ACCEPTED / OFFERS
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
              </div>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '24px' }}>{error}</div>}

        {/* Recent Applications Section */}
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
              Recent Applications
            </h2>
            <Link
              to="/seeker/applications"
              style={{
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              View all ({recentApplications.length}) →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div style={{ textAlign: 'left', padding: '32px 0', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem' }}>
                You have not submitted any job applications yet.
              </p>
              <Link to="/jobs" className="btn btn-primary">
                Explore open positions →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {recentApplications.map((app) => {
                const isPending = app.status === 'PENDING';
                const isReviewed = app.status === 'REVIEWED';
                const isAccepted = app.status === 'ACCEPTED';
                const isRejected = app.status === 'REJECTED';

                const formattedDate = new Date(app.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={app._id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <h3
                          style={{
                            fontSize: '1.2rem',
                            margin: '0 0 4px 0',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600
                          }}
                        >
                          {app.job?.title || 'Position'}
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 500 }}>
                          {app.job?.company} {app.job?.location ? `· ${app.job.location}` : ''}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <StatusBadge status={app.status} />
                        {app.job?._id && (
                          <Link
                            to={`/jobs/${app.job._id}`}
                            style={{
                              fontSize: '0.84rem',
                              color: 'var(--text-muted)',
                              textDecoration: 'none'
                            }}
                          >
                            View role →
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Editorial Text Timeline:
                        ● Application submitted
                        │  Sep 28 · 10:42 AM
                        │
                        ● Application reviewed
                        │
                        ○ Employer decision
                           Pending
                    */}
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.84rem',
                        lineHeight: 1.6,
                        color: 'var(--text-muted)',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '16px 20px'
                      }}
                    >
                      <div style={{ color: 'var(--text)', fontWeight: 600 }}>
                        <span style={{ color: 'var(--accent)', marginRight: '8px' }}>●</span> Application submitted
                      </div>
                      <div style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        │ {formattedDate}
                      </div>
                      <div style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        │
                      </div>
                      <div style={{ color: isReviewed || isAccepted || isRejected ? 'var(--text)' : 'var(--text-muted)', fontWeight: isReviewed || isAccepted || isRejected ? 600 : 400 }}>
                        <span style={{ color: isReviewed || isAccepted || isRejected ? 'var(--accent)' : 'var(--border-strong)', marginRight: '8px' }}>
                          {isReviewed || isAccepted || isRejected ? '●' : '○'}
                        </span>{' '}
                        Application reviewed
                      </div>
                      <div style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        │ {isReviewed || isAccepted || isRejected ? 'Under employer evaluation' : 'Pending review'}
                      </div>
                      <div style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        │
                      </div>
                      <div style={{ color: isAccepted || isRejected ? 'var(--text)' : 'var(--text-muted)', fontWeight: isAccepted || isRejected ? 600 : 400 }}>
                        <span style={{ color: isAccepted ? 'var(--accent)' : isRejected ? 'var(--accent-rose)' : 'var(--border-strong)', marginRight: '8px' }}>
                          {isAccepted || isRejected ? '●' : '○'}
                        </span>{' '}
                        Employer decision: {isAccepted ? 'Accepted' : isRejected ? 'Closed / Not selected' : 'Pending'}
                      </div>
                    </div>
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

export default SeekerDashboard;
