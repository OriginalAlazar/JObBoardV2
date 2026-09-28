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
  const { user, isSeeker, isEmployer, isAuthenticated } = useAuth();

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
        setError(err.response?.data?.message || 'Job not found');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user]);

  if (loading) return <Loading message="Loading job posting details..." />;

  if (error || !job) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 20px' }}>
          {error || 'Unable to display job posting.'}
        </div>
        <Link to="/jobs" className="btn btn-secondary">
          ← Back to All Jobs
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
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500, color: 'var(--text-muted)' }}>
            ← Back to Job Listings
          </Link>
        </div>

        {/* Job Header Card */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: 0 }}>{job.title}</h1>
                <StatusBadge status={job.status} />
              </div>
              <div style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 600 }}>
                {job.company}
              </div>
            </div>

            {/* Apply Action CTA */}
            <div>
              {job.status === 'CLOSED' ? (
                <button className="btn btn-secondary" disabled>
                  Posting Closed
                </button>
              ) : hasApplied ? (
                <div style={{
                  background: 'var(--accent-green-bg)',
                  color: 'var(--accent-green)',
                  border: '1px solid var(--accent-green-border)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  ✓ Application Submitted
                </div>
              ) : isEmployer ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Employer account (cannot apply)
                </span>
              ) : isAuthenticated ? (
                <button
                  id="apply-job-btn"
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}
                  style={{ padding: '12px 28px', fontSize: '1rem' }}
                >
                  Apply for this Position
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })}
                  style={{ padding: '12px 28px', fontSize: '1rem' }}
                >
                  Sign in to Apply
                </button>
              )}
            </div>
          </div>

          {/* Key Metadata Row */}
          <div className="job-meta-row" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <span className="job-tag">📍 {job.location}</span>
            <span className="job-tag">💼 {job.type}</span>
            <span className="job-tag">🏷️ {job.category}</span>
            <span className="job-tag salary-tag">💰 {formattedSalary} / year</span>
            <span className="job-tag" style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
              Posted on {formattedDate}
            </span>
          </div>
        </div>

        {/* Job Content Body */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '16px' }}>Role Description</h2>
          <div style={{ lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginBottom: '32px' }}>
            {job.description}
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '16px' }}>Requirements &amp; Qualifications</h2>
              <ul style={{ paddingLeft: '24px', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '32px' }}>
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </>
          )}

          {/* Employer Contact Card */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
              About the Recruiter
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Posted by <strong>{job.postedBy?.name || 'Recruiter'}</strong> at {job.company}
            </div>
          </div>
        </div>

        {/* Modal Dialog for Application */}
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
