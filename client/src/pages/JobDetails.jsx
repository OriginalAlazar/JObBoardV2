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
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 20px' }}>
          {error || 'Unable to display job posting.'}
        </div>
        <Link to="/jobs" className="btn btn-secondary">
          ← Back to All Openings
        </Link>
      </div>
    );
  }

  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(job.salary || 0);

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

        {/* 70/30 Master-Detail Split Layout */}
        <div className="master-detail-layout">
          
          {/* Left Column (70%): Long-form Editorial Reading Column */}
          <article className="reading-column">
            
            {/* Header Block */}
            <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <StatusBadge status={job.status} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Posted on {formattedDate}
                </span>
              </div>

              <h1 style={{ fontSize: '2.6rem', marginBottom: '8px', lineHeight: 1.15 }}>
                {job.title}
              </h1>

              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '20px' }}>
                {job.company}
              </div>

              {/* Accessible Metadata Chips with Explicit Wording + Icons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <span className="meta-chip">
                  <span aria-hidden="true">📍</span> Location: <strong>{job.location}</strong>
                </span>
                <span className="meta-chip">
                  <span aria-hidden="true">💼</span> Type: <strong>{job.type}</strong>
                </span>
                <span className="meta-chip">
                  <span aria-hidden="true">🏷️</span> Category: <strong>{job.category}</strong>
                </span>
                <span className="meta-chip" style={{ color: 'var(--accent-green)' }}>
                  <span aria-hidden="true">💰</span> Compensation: <strong>{formattedSalary} / yr</strong>
                </span>
              </div>
            </div>

            {/* Role Responsibilities & Overview */}
            <section style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>About the Role</h2>
              <div style={{ whiteSpace: 'pre-line', lineHeight: 1.75 }}>
                {job.description}
              </div>
            </section>

            {/* Key Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Key Qualifications &amp; Skills</h2>
                <ul style={{ lineHeight: 1.8 }}>
                  {job.requirements.map((req, idx) => (
                    <li key={idx} style={{ paddingLeft: '4px' }}>{req}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Hiring Team / Recruiter Card */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              marginTop: '40px'
            }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                Hiring Team
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                This role is published and reviewed by <strong>{job.postedBy?.name || 'Recruiter'}</strong> at {job.company}.
              </p>
            </div>

          </article>

          {/* Right Column (30%): Sticky Application & Metadata Card on Desktop (lg:sticky lg:top-90) */}
          <aside className="sticky-sidebar">
            <div className="card" style={{ padding: '28px', border: '1px solid var(--border-strong)' }}>
              
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Compensation
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  {formattedSalary}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>/ year</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <StatusBadge status={job.status} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Work Model</span>
                  <strong>{job.type}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location</span>
                  <strong>{job.location}</strong>
                </div>
              </div>

              {/* Action Button */}
              {job.status === 'CLOSED' ? (
                <button className="btn btn-secondary" style={{ width: '100%', padding: '12px' }} disabled>
                  Position Closed
                </button>
              ) : hasApplied ? (
                <div style={{
                  background: 'var(--accent-green-bg)',
                  color: 'var(--accent-green)',
                  border: '1px solid var(--accent-green-border)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textAlign: 'center'
                }}>
                  ✓ Application Submitted
                </div>
              ) : isEmployer ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>
                  Employer account logged in
                </div>
              ) : isAuthenticated ? (
                <button
                  id="apply-job-btn"
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}
                  style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                >
                  Apply for this Position →
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })}
                  style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                >
                  Sign in to Apply →
                </button>
              )}

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '14px', marginBottom: 0 }}>
                Direct employer submission • No agency intermediaries
              </p>

            </div>
          </aside>

        </div>

        {/* 3-Step Progressive Application Modal */}
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
