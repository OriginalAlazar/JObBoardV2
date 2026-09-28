import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ApplicationModal = ({ job, isOpen, onClose, onApplied }) => {
  const { user } = useAuth();

  // Multi-step state: 1 = Applicant Info, 2 = Materials, 3 = Review & Confirm
  const [step, setStep] = useState(1);

  // Form fields
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync user info on open
  useEffect(() => {
    if (user) {
      if (!applicantName) setApplicantName(user.name || '');
      if (!applicantEmail) setApplicantEmail(user.email || '');
    }
  }, [user, applicantName, applicantEmail]);

  // Escape key platform dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  // Progressive validation for Step 1
  const validateStep1 = () => {
    setError('');
    if (!applicantName.trim()) {
      setError('Please provide your full name.');
      return false;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      setError('Please provide a valid contact email address.');
      return false;
    }
    return true;
  };

  // Progressive validation for Step 2
  const validateStep2 = () => {
    setError('');
    const urlPattern = /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([\w/_.-]*(\?\S+)?)?)?$/;
    if (!urlPattern.test(resumeLink.trim())) {
      setError('Please provide a valid HTTP/HTTPS link to your online resume or portfolio.');
      return false;
    }
    if (coverLetter.trim().length < 20) {
      setError('Cover letter must be at least 20 characters long.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep2()) {
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/applications', {
        jobId: job._id,
        coverLetter: coverLetter.trim(),
        resumeLink: resumeLink.trim(),
      });
      setSuccess(true);
      if (onApplied) onApplied();
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setStep(1);
        setCoverLetter('');
        setResumeLink('');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header with Progress Stepper */}
        <div className="modal-header">
          <div>
            <h3 id="modal-title" style={{ fontSize: '1.3rem', marginBottom: '2px', fontFamily: 'var(--font-serif)' }}>
              Apply for {job.title}
            </h3>
            <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}>
              {job.company} • {job.location}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* 3-Step Progress Stepper Header */}
        {!success && (
          <div className="stepper-header">
            <div className="step-indicator">
              <span className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: step === 1 ? 700 : 500, color: step === 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Applicant
              </span>
            </div>

            <div style={{ flex: 1, height: '2px', background: step > 1 ? 'var(--accent-green)' : 'var(--border-subtle)', margin: '0 8px' }} />

            <div className="step-indicator">
              <span className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: step === 2 ? 700 : 500, color: step === 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Materials
              </span>
            </div>

            <div style={{ flex: 1, height: '2px', background: step > 2 ? 'var(--accent-green)' : 'var(--border-subtle)', margin: '0 8px' }} />

            <div className="step-indicator">
              <span className={`step-dot ${step === 3 ? 'active' : ''}`}>
                3
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: step === 3 ? 700 : 500, color: step === 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Review
              </span>
            </div>
          </div>
        )}

        {success ? (
          <div className="alert alert-success" style={{ textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
            <h4 style={{ color: 'var(--accent-green)', marginBottom: '6px', fontSize: '1.25rem' }}>Application Submitted!</h4>
            <p style={{ margin: 0 }}>Your candidate submission has been delivered directly to {job.company}. Closing window...</p>
          </div>
        ) : (
          <div>
            {error && <div className="alert alert-error">{error}</div>}

            {/* STEP 1: Applicant Profile Confirmation */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Step 1 of 3: Confirm your applicant identity and contact details.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="app-name">
                    Full Name <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <input
                    id="app-name"
                    type="text"
                    className="form-input"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="app-email">
                    Contact Email Address <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <input
                    id="app-email"
                    type="email"
                    className="form-input"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    Recruitment updates and interview decisions will be sent to this email.
                  </small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    Next: Add Application Materials →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Application Materials (Resume Link & Cover Letter) */}
            {step === 2 && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Step 2 of 3: Provide your online resume/portfolio and introduction.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="resumeLink">
                    Online Resume or Portfolio Link <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <input
                    id="resumeLink"
                    type="url"
                    className="form-input"
                    placeholder="https://drive.google.com/file/d/your-cv/view"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    Must be a valid HTTP/HTTPS link (Google Drive, Dropbox, LinkedIn, personal website).
                  </small>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="coverLetter">
                      Cover Letter / Professional Introduction <span style={{ color: 'var(--accent-rose)' }}>*</span>
                    </label>
                    <span style={{
                      fontSize: '0.75rem',
                      color: coverLetter.length >= 20 ? 'var(--accent-green)' : 'var(--text-muted)',
                      fontWeight: 600
                    }}>
                      {coverLetter.length} / 20 min
                    </span>
                  </div>
                  <textarea
                    id="coverLetter"
                    className="form-textarea"
                    rows={5}
                    placeholder="Describe your background, technical skills, and why you are interested in this position..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleBack}>
                    ← Back to Applicant Info
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={coverLetter.trim().length < 20 || !resumeLink.trim()}
                    onClick={handleNext}
                  >
                    Next: Review Application →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review with Direct Edit Links & Submission */}
            {step === 3 && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Step 3 of 3: Review your details before final submission. Click "Edit" on any section to modify.
                </p>

                {/* Section 1 Review */}
                <div className="review-section">
                  <div className="review-header">
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Applicant Details</strong>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Edit ✏️
                    </button>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <div>Name: <strong>{applicantName}</strong></div>
                    <div>Email: <strong>{applicantEmail}</strong></div>
                  </div>
                </div>

                {/* Section 2 Review */}
                <div className="review-section">
                  <div className="review-header">
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Materials &amp; Introduction</strong>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Edit ✏️
                    </button>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '6px' }}>
                      Resume Link:{' '}
                      <a href={resumeLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                        {resumeLink}
                      </a>
                    </div>
                    <div>
                      Cover Letter:
                      <div style={{
                        marginTop: '4px',
                        background: 'var(--bg-surface)',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        whiteSpace: 'pre-line',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        fontSize: '0.85rem'
                      }}>
                        {coverLetter}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleBack} disabled={submitting}>
                    ← Back to Materials
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={submitting}
                    onClick={handleSubmit}
                    style={{ padding: '10px 24px' }}
                  >
                    {submitting ? 'Submitting Application...' : 'Confirm & Submit Application ✓'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ApplicationModal;
