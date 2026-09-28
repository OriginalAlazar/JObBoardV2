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
        setError(err.response?.data?.message || 'Failed to load seeker dashboard.');
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

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Editorial Greeting Header */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Candidate Workspace
              </span>
              <h1 style={{ fontSize: '2.4rem', margin: '4px 0 6px', lineHeight: 1.15 }}>
                {getGreeting()}, {user?.name || 'Applicant'}
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>
                Your active applications and real-time recruitment progression.
              </p>
            </div>

            <Link to="/jobs" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              Explore Open Positions →
            </Link>
          </div>

          {/* Operational Metrics Horizontal Split (Avoiding 3-card generic cliché) */}
          {stats && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '32px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.92rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Applications
                </span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {stats.totalApplications}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Awaiting Review
                </span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                  {stats.pending}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Under Evaluation
                </span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
                  {stats.reviewed}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Offers / Accepted
                </span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                  {stats.accepted}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Semantic UX4G Journey Timeline Section */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Application Journeys</h2>
            <Link to="/seeker/applications" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}>
              View All Submissions ({recentApplications.length}) →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
              <h3 style={{ marginBottom: '8px' }}>No Active Journeys Yet</h3>
              <p style={{ maxWidth: '420px', margin: '0 auto 20px' }}>
                You haven't submitted any job applications yet. Browse vetted positions and track your review status directly here.
              </p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Directory
              </Link>
            </div>
          ) : (
            <ol role="list" className="journey-timeline" aria-label="Candidate Application Progress Timeline">
              {recentApplications.map((app) => {
                const isPending = app.status === 'PENDING';
                const isReviewed = app.status === 'REVIEWED';
                const isAccepted = app.status === 'ACCEPTED';
                const isRejected = app.status === 'REJECTED';

                return (
                  <li key={app._id} role="listitem" className="journey-step" aria-label={`${app.job?.title} at ${app.job?.company}, status: ${app.status}`}>
                    {/* Visual Stepper Marker & Decorative Connector */}
                    <div className="journey-marker" aria-hidden="true">
                      <div className={`journey-dot ${isAccepted ? 'completed' : isReviewed || isPending ? 'active' : ''}`}>
                        {isAccepted ? '✓' : ''}
                      </div>
                      <div className="journey-line" />
                    </div>

                    {/* Content Details */}
                    <div className="journey-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                            {app.job?.title || 'Unknown Position'}
                          </h4>
                          <span style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {app.job?.company}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <StatusBadge status={app.status} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Timeline Stage Indicators */}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          Step 1: Submitted ✓
                        </span>
                        <span>→</span>
                        <span style={{ color: isReviewed || isAccepted ? 'var(--text-primary)' : undefined, fontWeight: isReviewed ? 700 : 500 }}>
                          Step 2: Under Review {isReviewed || isAccepted ? '✓' : ''}
                        </span>
                        <span>→</span>
                        <span style={{
                          color: isAccepted ? 'var(--accent-green)' : isRejected ? 'var(--accent-rose)' : undefined,
                          fontWeight: isAccepted || isRejected ? 700 : 500
                        }}>
                          Step 3: {isAccepted ? 'Accepted 🎉' : isRejected ? 'Decision Made' : 'Final Decision'}
                        </span>
                      </div>

                      {app.job?._id && (
                        <div style={{ marginTop: '10px' }}>
                          <Link to={`/jobs/${app.job._id}`} style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                            View Original Posting →
                          </Link>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

      </div>
    </div>
  );
};

export default SeekerDashboard;
