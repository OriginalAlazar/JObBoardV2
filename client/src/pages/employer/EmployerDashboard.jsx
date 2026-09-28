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
        setRecentJobs(jobsRes.data.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employer dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, []);

  if (loading) return <Loading message="Loading recruitment analytics..." />;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>
              Employer Hub: {user?.company || user?.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Recruitment pipeline overview, active postings, and applicant tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/employer/jobs" className="btn btn-secondary">
              Manage Postings
            </Link>
            <Link to="/employer/jobs/create" className="btn btn-primary">
              + Post New Job
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Analytics Metric Cards */}
        {stats && (
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-card-title">Total Postings</span>
              <span className="stat-card-value">{stats.totalJobs}</span>
              <span className="stat-card-desc">{stats.openJobs} active • {stats.closedJobs} closed</span>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <span className="stat-card-title">Total Applicants</span>
              <span className="stat-card-value" style={{ color: 'var(--primary)' }}>{stats.totalApplicants}</span>
              <span className="stat-card-desc">Across all your job postings</span>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
              <span className="stat-card-title">Pending Review</span>
              <span className="stat-card-value" style={{ color: 'var(--accent-amber)' }}>{stats.pending}</span>
              <span className="stat-card-desc">Need initial evaluation</span>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
              <span className="stat-card-title">Accepted Offers</span>
              <span className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{stats.accepted}</span>
              <span className="stat-card-desc">{stats.reviewed} under evaluation</span>
            </div>
          </div>
        )}

        {/* Recent Postings Table */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Active Job Postings</h2>
            <Link to="/employer/jobs" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              View All Postings ({recentJobs.length}) →
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💼</div>
              <h3>No Job Postings Yet</h3>
              <p style={{ maxWidth: '420px', margin: '0 auto 20px' }}>
                You haven't posted any open positions yet. Publish your first opening to attract qualified applicants.
              </p>
              <Link to="/employer/jobs/create" className="btn btn-primary">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Category &amp; Type</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Applicants</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{job.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{job.location}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{job.category}</span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{job.type}</div>
                      </td>
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
                            gap: '4px'
                          }}
                        >
                          👥 {job.applicantCount || 0} candidates
                        </Link>
                      </td>
                      <td>
                        <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                          <Link
                            to={`/employer/jobs/${job._id}/applications`}
                            className="btn btn-secondary"
                            style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                          >
                            Review
                          </Link>
                          <Link
                            to={`/employer/jobs/${job._id}/edit`}
                            className="btn btn-secondary"
                            style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                          >
                            Edit
                          </Link>
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
    </div>
  );
};

export default EmployerDashboard;
