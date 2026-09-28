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

  if (loading) return <Loading message="Loading seeker overview..." />;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>
              Welcome, {user?.name || 'Job Seeker'} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Track your candidate submissions and recruitment updates in real-time.
            </p>
          </div>

          <Link to="/jobs" className="btn btn-primary">
            Explore Open Jobs →
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Analytics Metric Cards */}
        {stats && (
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-card-title">Total Submissions</span>
              <span className="stat-card-value">{stats.totalApplications}</span>
              <span className="stat-card-desc">All applications submitted</span>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
              <span className="stat-card-title">Pending Review</span>
              <span className="stat-card-value" style={{ color: 'var(--accent-amber)' }}>{stats.pending}</span>
              <span className="stat-card-desc">Awaiting initial employer review</span>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
              <span className="stat-card-title">Under Evaluation</span>
              <span className="stat-card-value" style={{ color: 'var(--accent-purple)' }}>{stats.reviewed}</span>
              <span className="stat-card-desc">Reviewed by recruitment team</span>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
              <span className="stat-card-title">Offers / Accepted</span>
              <span className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{stats.accepted}</span>
              <span className="stat-card-desc">Accepted applications</span>
            </div>
          </div>
        )}

        {/* Recent Applications Section */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Applications</h2>
            <Link to="/seeker/applications" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              View All Submissions →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📝</div>
              <h3>No Applications Yet</h3>
              <p style={{ maxWidth: '420px', margin: '0 auto 20px' }}>
                You haven't submitted any job applications yet. Browse open postings and apply directly.
              </p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Available Jobs
              </Link>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Position &amp; Company</th>
                    <th>Location</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.job?.title || 'Unknown Position'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.job?.company || 'Company'}</div>
                      </td>
                      <td>{app.job?.location || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {new Date(app.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        {app.job?._id ? (
                          <Link to={`/jobs/${app.job._id}`} className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                            View Posting
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SeekerDashboard;
