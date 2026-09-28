import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ApplicationModal from '../components/ApplicationModal';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEmployer, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);

        // If authenticated job seeker, check if already applied
        if (user && user.role === 'JOB_SEEKER') {
          try {
            const appsRes = await api.get('/applications/me');
            const found = appsRes.data.some(
              (app) => app.job?._id === id || app.job === id
            );
            setHasApplied(found);
          } catch {
            // Non-critical check
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Job posting not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user]);

  if (loading) return <Loading message="Loading position overview..." />;

  if (error || !job) {
    return (
      <div className="container" style={{ padding: '64px var(--space-4)', textAlign: 'left' }}>
        <div className="alert alert-error" style={{ maxWidth: '600px', marginBottom: '20px' }}>
          {error || 'Unable to display job posting.'}
        </div>
        <Link to="/jobs" className="btn btn-secondary">
          ← Back to All Openings
        </Link>
      </div>
    );
  }

  const formattedSalary = job.salary
    ? `ETB ${Number(job.salary).toLocaleString()}`
    : 'Competitive';

  const formattedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container">
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '28px' }}>
          <Link
            to="/jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              fontSize: '0.92rem',
              color: 'var(--text-muted)',
              textDecoration: 'none'
            }}
          >
            ← Back to Directory
          </Link>
        </div>

        {/* Editorial Split Layout (Left Sticky Summary, Right Reading Column) */}
        <div className="split-job-layout">
          
          {/* Left Column (Sticky Desktop): Job Meta Summary & Direct Action */}
          <aside className="sticky-job-col">
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                padding: '28px'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <StatusBadge status={job.status} />
              </div>

              <h1
                style={{
                  fontSize: '2rem',
                  lineHeight: 1.15,
                  marginBottom: '6px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase'
                }}
              >
                {job.title}
              </h1>

              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  marginBottom: '20px'
                }}
              >
                {job.company}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  padding: '16px 0',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.92rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location</span>
                  <span style={{ fontWeight: 500 }}>{job.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Work type</span>
                  <span style={{ fontWeight: 500 }}>{job.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Category</span>
                  <span style={{ fontWeight: 500 }}>{job.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Compensation</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--accent)'
                    }}
                  >
                    {formattedSalary}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Published</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formattedDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {job.status === 'CLOSED' ? (
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.88rem' }}
                  disabled
                >
                  This opportunity is no longer accepting applications
                </button>
              ) : hasApplied ? (
                <div
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    border: '1px solid var(--border)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="status-dot dot-accepted" />
                  You've already applied for this job
                </div>
              ) : isEmployer ? (
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    padding: '8px'
                  }}
                >
                  Employer account active
                </div>
              ) : isAuthenticated ? (
                <button
                  id="apply-job-btn"
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}
                  style={{ width: '100%', padding: '12px', fontSize: '0.98rem' }}
                >
                  Apply now →
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })}
                  style={{ width: '100%', padding: '12px', fontSize: '0.98rem' }}
                >
                  Sign in to apply →
                </button>
              )}

              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  textAlign: 'left',
                  marginTop: '16px',
                  marginBottom: 0,
                  lineHeight: 1.4
                }}
              >
                Direct employer submission · Verified posting
              </p>
            </div>
          </aside>

          {/* Right Column: Long-form Editorial Reading Column */}
          <article className="reading-column">
            
            {/* Role Responsibilities & Overview */}
            <section style={{ marginBottom: '36px' }}>
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  marginBottom: '16px',
                  letterSpacing: '-0.01em'
                }}
              >
                About the role
              </h2>
              <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: 'var(--text)' }}>
                {job.description}
              </div>
            </section>

            {/* Key Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <h2
                  style={{
                    fontSize: '1.75rem',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    marginBottom: '16px',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Requirements
                </h2>
                <ul
                  style={{
                    listStyleType: 'disc',
                    paddingLeft: '20px',
                    lineHeight: 1.8,
                    color: 'var(--text)'
                  }}
                >
                  {job.requirements.map((req, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Hiring Team note */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
                padding: '20px 24px',
                marginTop: '40px'
              }}
            >
              <h3
                style={{
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  color: 'var(--text)'
                }}
              >
                Hiring Organization
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                This role is published and managed directly by <strong>{job.postedBy?.name || 'Recruitment Team'}</strong> at {job.company}.
              </p>
            </div>

          </article>

        </div>

        {/* Deliberate Progressive Application Modal / Drawer */}
        <ApplicationModal
          job={job}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApplied={() => {
            setHasApplied(true);
            setIsModalOpen(false);
          }}
        />

      </div>
    </div>
  );
};

export default JobDetails;
