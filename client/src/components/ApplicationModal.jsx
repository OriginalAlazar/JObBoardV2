/**
 * @file ApplicationModal.jsx
 * @description Accessible 3-step job application wizard modal dialog.
 * Guides job seekers through:
 *  - Step 1: Candidate identification & contact info verification
 *  - Step 2: Resume URL link and cover letter entry (with 20-char validation counter)
 *  - Step 3: Application summary review with section edit links prior to final submission.
 * Includes Escape key dismissal, backdrop click closing, and success confirmation.
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * ApplicationModal Component
 * 
 * @param {object} props - Component props
 * @param {object} props.job - Job posting being applied for
 * @param {boolean} props.isOpen - Whether modal dialog is currently visible
 * @param {Function} props.onClose - Callback triggered to close modal
 * @param {Function} [props.onApplied] - Callback triggered when application is successfully submitted
 */
const ApplicationModal = ({ job, isOpen, onClose, onApplied }) => {
  const { user } = useAuth();

  // Multi-step state: 1 = Your information, 2 = Your application, 3 = Review application
  const [step, setStep] = useState(1);

  // Controlled form fields
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Async submission and feedback states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Synchronize authenticated user credentials when modal opens or user profile changes
  useEffect(() => {
    if (user) {
      if (!applicantName) setApplicantName(user.name || '');
      if (!applicantEmail) setApplicantEmail(user.email || '');
    }
  }, [user, applicantName, applicantEmail]);

  // Platform standard accessibility: Allow dismissing modal dialog with Escape keyboard key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // If modal is closed or job details are not loaded, render nothing
  if (!isOpen || !job) return null;

  /**
   * validateStep1
   * Validates applicant name and email presence and structure before advancing
   * @returns {boolean} True if step 1 inputs are valid
   */
  const validateStep1 = () => {
    setError('');
    if (!applicantName.trim()) {
      setError('Please provide your name.');
      return false;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return false;
    }
    return true;
  };

  /**
   * validateStep2
   * Validates resume URL against HTTP/HTTPS web format and ensures cover letter has >= 20 characters
   * @returns {boolean} True if step 2 inputs are valid
   */
  const validateStep2 = () => {
    setError('');
    const urlPattern = /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([\w/_.-]*(\?\S+)?)?)?$/;
    if (!urlPattern.test(resumeLink.trim())) {
      setError('Please provide a valid resume link (HTTP/HTTPS URL).');
      return false;
    }
    if (coverLetter.trim().length < 20) {
      setError('Cover letter must be at least 20 characters long.');
      return false;
    }
    return true;
  };

  /**
   * handleNext
   * Validates current step before progressing to the next step
   */
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  /**
   * handleBack
   * Returns to previous wizard step
   */
  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  /**
   * handleSubmit
   * Submits application payload to `/api/applications` backend endpoint
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Re-verify Step 2 fields before submission
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
      // Show success feedback
      setSuccess(true);
      if (onApplied) onApplied();
      
      // Auto-close dialog after brief confirmation delay and reset wizard state
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setStep(1);
        setCoverLetter('');
        setResumeLink('');
      }, 1800);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
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
          boxShadow: 'none',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            borderBottom: '1px solid var(--border)',
            paddingBottom: '16px',
            marginBottom: '20px',
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
                marginBottom: '4px',
              }}
            >
              Apply for
            </span>
            <h3
              id="modal-title"
              style={{
                fontSize: '1.25rem',
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
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
              fontSize: '1.1rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              lineHeight: 1,
              padding: '4px 8px',
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
              borderBottom: '1px solid var(--border)',
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
                  color: step >= 1 ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                1
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: step === 1 ? 600 : 400,
                  color: step === 1 ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                Information
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
                  color: step >= 2 ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                2
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: step === 2 ? 600 : 400,
                  color: step === 2 ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                Application
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
                  color: step === 3 ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                3
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: step === 3 ? 600 : 400,
                  color: step === 3 ? 'var(--text)' : 'var(--text-muted)',
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
              padding: '32px 20px',
              textAlign: 'left',
              border: '1px solid var(--border)',
              background: 'var(--accent-soft)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              Success
            </span>
            <h4
              style={{
                color: 'var(--accent)',
                margin: '0 0 8px 0',
                fontSize: '1.35rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
              }}
            >
              Application submitted successfully.
            </h4>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Your application has been submitted and is waiting for review by {job.company}.
            </p>
          </div>
        ) : (
          <div>
            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

            {/* STEP 1: Your Information */}
            {step === 1 && (
              <div>
                <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-serif)', margin: '0 0 16px 0' }}>
                  Your information
                </h4>

                <div className="form-group">
                  <label className="form-label" htmlFor="app-name">
                    Name
                  </label>
                  <input
                    id="app-name"
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="app-email">
                    Email
                  </label>
                  <input
                    id="app-email"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email address"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    Status updates and decisions will be sent to this address.
                  </small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Your Application (Resume & Cover Letter) */}
            {step === 2 && (
              <div>
                <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-serif)', margin: '0 0 16px 0' }}>
                  Your application
                </h4>

                <div className="form-group">
                  <label className="form-label" htmlFor="resumeLink">
                    Resume
                  </label>
                  <input
                    id="resumeLink"
                    type="url"
                    className="form-input"
                    placeholder="Paste your resume link"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    Link to your CV, Google Drive document, Dropbox, or portfolio.
                  </small>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="coverLetter">
                      Cover letter
                    </label>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: coverLetter.length >= 20 ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                    >
                      {coverLetter.length} / 20 min
                    </span>
                  </div>
                  <textarea
                    id="coverLetter"
                    className="form-textarea"
                    rows={5}
                    placeholder="Tell the employer why you're a good fit..."
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
                    Review application →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review Application */}
            {step === 3 && (
              <div>
                <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-serif)', margin: '0 0 16px 0' }}>
                  Review application
                </h4>

                {/* Section 1 Review */}
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    marginBottom: '12px',
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Your Information
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
                        textDecoration: 'underline',
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
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Your Application
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
                        textDecoration: 'underline',
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                    <div style={{ marginBottom: '8px', wordBreak: 'break-all' }}>
                      Resume:{' '}
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
                      Cover letter:
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
                          lineHeight: 1.6,
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
                    {submitting ? 'Submitting application...' : 'Submit application'}
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
