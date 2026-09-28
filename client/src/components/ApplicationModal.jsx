import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ApplicationModal = ({ job, isOpen, onClose, onApplied }) => {
  const { user } = useAuth();

  // Multi-step state: 1 = Personal info, 2 = Application info / Materials, 3 = Review, 4 = Submit / Completed
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
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface)',
          boxShadow: 'none'
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            borderBottom: '1px solid var(--border)',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              Application Submission
            </span>
            <h3
              id="modal-title"
              style={{
                fontSize: '1.25rem',
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontWeight: 600
              }}
            >
              {job.title}
            </h3>
            <div style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.88rem', marginTop: '4px' }}>
              {job.company} · {job.location}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              lineHeight: 1,
              padding: '4px 8px'
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* 3-Step Progress Stepper Header */}
        {!success && (
          <div
            className="stepper-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border)'
            }}
          >
            <div className="step-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: step >= 1 ? 'var(--accent)' : 'var(--border)',
                  color: step >= 1 ? '#FFFFFF' : 'var(--text-muted)'
                }}
              >
                1
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: step === 1 ? 600 : 400,
                  color: step === 1 ? 'var(--text)' : 'var(--text-muted)'
                }}
              >
                Personal
              </span>
            </div>

            <div style={{ flex: 1, height: '1px', background: step > 1 ? 'var(--accent)' : 'var(--border)', margin: '0 12px' }} />

            <div className="step-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: step >= 2 ? 'var(--accent)' : 'var(--border)',
                  color: step >= 2 ? '#FFFFFF' : 'var(--text-muted)'
                }}
              >
                2
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: step === 2 ? 600 : 400,
                  color: step === 2 ? 'var(--text)' : 'var(--text-muted)'
                }}
              >
                Materials
              </span>
            </div>

            <div style={{ flex: 1, height: '1px', background: step > 2 ? 'var(--accent)' : 'var(--border)', margin: '0 12px' }} />

            <div className="step-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: step === 3 ? 'var(--accent)' : 'var(--border)',
                  color: step === 3 ? '#FFFFFF' : 'var(--text-muted)'
                }}
              >
                3
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: step === 3 ? 600 : 400,
                  color: step === 3 ? 'var(--text)' : 'var(--text-muted)'
                }}
              >
                Review
              </span>
            </div>
          </div>
        )}

        {success ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'left',
              border: '1px solid var(--border)',
              background: 'var(--accent-soft)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                letterSpacing: '0.04em',
                marginBottom: '8px'
              }}
            >
              Confirmed
            </div>
            <h4
              style={{
                color: 'var(--accent)',
                margin: '0 0 8px 0',
                fontSize: '1.4rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600
              }}
            >
              Application Submitted
            </h4>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Your candidate profile and materials have been submitted directly to {job.company}.
            </p>
          </div>
        ) : (
          <div>
            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

            {/* STEP 1: Applicant Profile Confirmation */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Step 1 of 3: Provide your contact details for this submission.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="app-name">
                    Full Name
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
                    Contact Email Address
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
                    Status updates and recruitment decisions will be sent to this email.
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
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Step 2 of 3: Provide your online resume and brief statement.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="resumeLink">
                    Online Resume or Portfolio Link
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
                    Accepted formats: Google Drive, Dropbox, Notion, or personal portfolio URL.
                  </small>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="coverLetter">
                      Cover Letter / Statement
                    </label>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: coverLetter.length >= 20 ? 'var(--accent)' : 'var(--text-muted)'
                      }}
                    >
                      {coverLetter.length} / 20 min
                    </span>
                  </div>
                  <textarea
                    id="coverLetter"
                    className="form-textarea"
                    rows={5}
                    placeholder="Describe your relevant background and interest in this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleBack}>
                    ← Back
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
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Step 3 of 3: Review your submission before confirming.
                </p>

                {/* Section 1 Review */}
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    marginBottom: '12px',
                    background: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Applicant Details
                    </strong>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent)',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                    <div>Name: <strong>{applicantName}</strong></div>
                    <div style={{ marginTop: '4px' }}>Email: <strong>{applicantEmail}</strong></div>
                  </div>
                </div>

                {/* Section 2 Review */}
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    marginBottom: '20px',
                    background: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Materials
                    </strong>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent)',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                    <div style={{ marginBottom: '8px', wordBreak: 'break-all' }}>
                      Resume Link:{' '}
                      <a
                        href={resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                      >
                        {resumeLink}
                      </a>
                    </div>
                    <div>
                      Cover Letter:
                      <div
                        style={{
                          marginTop: '6px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          whiteSpace: 'pre-line',
                          maxHeight: '120px',
                          overflowY: 'auto',
                          fontSize: '0.85rem',
                          lineHeight: 1.6
                        }}
                      >
                        {coverLetter}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleBack} disabled={submitting}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={submitting}
                    onClick={handleSubmit}
                    style={{ padding: '10px 24px' }}
                  >
                    {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
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
