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
  const [selectedApp, setSelectedApp] = useState(null);

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

  if (loading) return <Loading message="Loading submitted applications..." />;

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
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
              Candidate Records
            </span>
            <h1
              style={{
                fontSize: '2.4rem',
                margin: '0 0 6px 0',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                letterSpacing: '-0.02em'
              }}
            >
              My Applications
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              Review the real-time status and submission records for your active applications.
            </p>
          </div>

          <Link to="/jobs" className="btn btn-primary">
            Explore more roles →
          </Link>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
        {successMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{successMsg}</div>}

        {/* Status Filter Tabs - Rectangular, not pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '12px'
          }}
        >
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
                  background: activeTab === tab ? 'var(--accent)' : 'var(--surface)',
                  color: activeTab === tab ? '#FFFFFF' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: activeTab === tab ? 'var(--accent)' : 'var(--border)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'background var(--duration-fast), color var(--duration-fast)'
                }}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              padding: '48px 24px',
              textAlign: 'left'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: '0 0 8px 0' }}>
              Your applications will appear here.
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 20px 0', fontSize: '0.92rem' }}>
              {activeTab === 'ALL'
                ? 'Once you apply for a position, you can track its progress from this page.'
                : `You currently have no applications with status "${activeTab}".`}
            </p>
            <Link to="/jobs" className="btn btn-primary">
              Explore opportunities
            </Link>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              overflowX: 'auto'
            }}
          >
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Position &amp; Organization
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Date Submitted
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Resume
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>
                        {app.job?.title || 'Position'}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {app.job?.company} {app.job?.location ? `· ${app.job.location}` : ''}
                      </div>
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
                        View Link →
                      </a>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => setSelectedApp(selectedApp?._id === app._id ? null : app)}
                        >
                          {selectedApp?._id === app._id ? 'Close' : 'Details'}
                        </button>

                        {/* Withdrawal action - allowed only in PENDING state */}
                        {app.status === 'PENDING' && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
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

        {/* Selected Application Details Drawer / Card */}
        {selectedApp && (
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
                  Submission Details
                </span>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: '4px 0' }}>
                  {selectedApp.job?.title}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
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
                style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px' }}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Submitted Statement / Cover Letter
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
                {selectedApp.coverLetter}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a
                href={selectedApp.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.84rem', padding: '8px 14px' }}
              >
                Open Resume Link →
              </a>
              {selectedApp.job?._id && (
                <Link
                  to={`/jobs/${selectedApp.job._id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.84rem', padding: '8px 14px' }}
                >
                  View Job Details →
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
