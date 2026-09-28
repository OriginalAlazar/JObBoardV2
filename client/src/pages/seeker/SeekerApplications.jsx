import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';

const STATUS_TABS = ['ALL', 'PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'];

const SeekerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null); // For viewing cover letter detail

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/applications/me');
      setApplications(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    const confirmed = window.confirm(
      'Are you sure you want to withdraw this application? Once withdrawn, the employer will no longer consider your submission.'
    );
    if (!confirmed) return;

    try {
      setWithdrawingId(appId);
      setError('');
      await api.delete(`/applications/${appId}`);
      setSuccessMsg('Application successfully withdrawn.');
      setApplications((prev) => prev.filter((app) => app._id !== appId));
      if (selectedApp?._id === appId) setSelectedApp(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'ALL') return true;
    return app.status === activeTab;
  });

  if (loading) return <Loading message="Loading your submitted applications..." />;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>My Applications</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Review the current status and submission details of all your job applications.
            </p>
          </div>

          <Link to="/jobs" className="btn btn-primary">
            + Apply for More Jobs
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px'
        }}>
          {STATUS_TABS.map((tab) => {
            const count = tab === 'ALL'
              ? applications.length
              : applications.filter((a) => a.status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'var(--primary)' : 'var(--bg-surface)',
                  color: activeTab === tab ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: activeTab === tab ? 'var(--primary)' : 'var(--border-strong)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {tab === 'ALL' ? 'All Submissions' : tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
            <h3>No Applications in this Category</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
              {activeTab === 'ALL'
                ? 'You have not submitted any applications yet.'
                : `You currently have no applications with status "${activeTab}".`}
            </p>
            <Link to="/jobs" className="btn btn-primary">
              Explore Available Positions
            </Link>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title &amp; Company</th>
                  <th>Applied On</th>
                  <th>Resume Link</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>
                        {app.job?.title || 'Unknown Position'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {app.job?.company} • {app.job?.location}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
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
                        style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.88rem', textDecoration: 'underline' }}
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
                          style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                          onClick={() => setSelectedApp(selectedApp?._id === app._id ? null : app)}
                        >
                          {selectedApp?._id === app._id ? 'Hide Details' : 'Details'}
                        </button>

                        {/* Withdrawal action - allowed only in PENDING state (BR-011) */}
                        {app.status === 'PENDING' && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                            disabled={withdrawingId === app._id}
                            onClick={() => handleWithdraw(app._id)}
                            title="Withdraw application from employer consideration"
                          >
                            {withdrawingId === app._id ? 'Withdrawing...' : 'Withdraw'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Application Details Modal / Card */}
        {selectedApp && (
          <div className="card" style={{ marginTop: '28px', padding: '24px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                  Submission Details: {selectedApp.job?.title}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Submitted to {selectedApp.job?.company} on{' '}
                  {new Date(selectedApp.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                SUBMITTED COVER LETTER
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
                {selectedApp.coverLetter}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <a
                href={selectedApp.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                Open Submitted Resume Link ↗
              </a>
              {selectedApp.job?._id && (
                <Link
                  to={`/jobs/${selectedApp.job._id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                >
                  View Original Job Posting
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SeekerApplications;
