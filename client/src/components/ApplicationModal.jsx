import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ApplicationModal = ({ job, isOpen, onClose, onApplied }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (coverLetter.trim().length < 20) {
      setError('Cover letter must be at least 20 characters long.');
      return;
    }

    const urlPattern = /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([\w/_.-]*(\?\S+)?)?)?$/;
    if (!urlPattern.test(resumeLink.trim())) {
      setError('Please provide a valid HTTP/HTTPS URL (e.g. Google Drive, Dropbox, LinkedIn).');
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
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '2px' }}>Apply for Position</h3>
            <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              {job.title} • {job.company}
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

        {success ? (
          <div className="alert alert-success" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
            <h4 style={{ color: 'var(--accent-green)', marginBottom: '6px' }}>Application Submitted!</h4>
            <p>Your application has been received by {job.company}. Closing dialog...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="resumeLink">
                Online Resume / Portfolio Link <span style={{ color: 'var(--accent-rose)' }}>*</span>
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
                Paste a public link from Google Drive, Dropbox, LinkedIn, or your portfolio.
              </small>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="coverLetter">
                  Cover Letter / Introduction <span style={{ color: 'var(--accent-rose)' }}>*</span>
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
                placeholder="Briefly introduce yourself, relevant experience, and why you are interested in this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || coverLetter.trim().length < 20}
              >
                {submitting ? 'Submitting Application...' : 'Send Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal;
