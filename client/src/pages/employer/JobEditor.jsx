import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';

const CATEGORIES = [
  'Technology',
  'Healthcare',
  'Finance & Banking',
  'Marketing',
  'Design',
  'Sales',
  'Customer Support',
  'Human Resources',
  'Other',
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

const JobEditor = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
    location: '',
    category: 'Technology',
    type: 'Full-time',
    salary: '',
    description: '',
    requirementsText: '',
    status: 'OPEN',
  });

  const [fetching, setFetching] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchJob = async () => {
        try {
          setFetching(true);
          const res = await api.get(`/jobs/${id}`);
          const job = res.data;
          setFormData({
            title: job.title || '',
            company: job.company || user?.company || '',
            location: job.location || '',
            category: job.category || 'Technology',
            type: job.type || 'Full-time',
            salary: job.salary ? String(job.salary) : '',
            description: job.description || '',
            requirementsText: (job.requirements || []).join('\n'),
            status: job.status || 'OPEN',
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load job details for editing.');
        } finally {
          setFetching(false);
        }
      };

      fetchJob();
    }
  }, [id, isEditMode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const requirements = formData.requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      location: formData.location.trim(),
      category: formData.category,
      type: formData.type,
      salary: Number(formData.salary) || 0,
      description: formData.description.trim(),
      requirements,
      status: formData.status,
    };

    if (!payload.title || !payload.company || !payload.location || !payload.description) {
      setError('Please fill in all required fields (title, company, location, and description).');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditMode) {
        await api.put(`/jobs/${id}`, payload);
      } else {
        await api.post('/jobs', payload);
      }
      navigate('/employer/jobs', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) return <Loading message="Loading job posting details..." />;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '20px' }}>
          <Link to="/employer/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
            ← Back to My Jobs
          </Link>
        </div>

        <div className="card" style={{ padding: '36px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>
              {isEditMode ? 'Edit Job Posting' : 'Post a New Job Opportunity'}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {isEditMode
                ? 'Update specifications, role requirements, or adjust posting status.'
                : 'Fill in details below to publish an opening to verified candidates.'}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Title & Company */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="job-title">
                  Position Title <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  id="job-title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="job-company">
                  Company Name <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  id="job-company"
                  name="company"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Location & Salary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="job-location">
                  Location <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  id="job-location"
                  name="location"
                  type="text"
                  className="form-input"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="job-salary">
                  Annual Salary ($ USD) <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  id="job-salary"
                  name="salary"
                  type="number"
                  min="0"
                  step="1000"
                  className="form-input"
                  placeholder="e.g. 120000"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Category & Employment Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="job-category">
                  Category <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <select
                  id="job-category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="job-type">
                  Employment Type <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <select
                  id="job-type"
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status (Edit Mode Only) */}
            {isEditMode && (
              <div className="form-group">
                <label className="form-label" htmlFor="job-status">
                  Posting Status
                </label>
                <select
                  id="job-status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="OPEN">OPEN (Accepting Applications)</option>
                  <option value="CLOSED">CLOSED (Archived / Closed)</option>
                </select>
              </div>
            )}

            {/* Role Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="job-description">
                Role Description <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <textarea
                id="job-description"
                name="description"
                className="form-textarea"
                rows={6}
                placeholder="Describe role responsibilities, team impact, and day-to-day work..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Requirements list */}
            <div className="form-group">
              <label className="form-label" htmlFor="job-requirements">
                Key Requirements &amp; Qualifications (one per line)
              </label>
              <textarea
                id="job-requirements"
                name="requirementsText"
                className="form-textarea"
                rows={5}
                placeholder="3+ years React and Node.js experience&#10;Strong understanding of RESTful APIs&#10;Experience with MongoDB or NoSQL databases"
                value={formData.requirementsText}
                onChange={handleChange}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                Enter each qualification on a separate line.
              </small>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
              <Link to="/employer/jobs" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ padding: '10px 28px' }}
              >
                {submitting
                  ? (isEditMode ? 'Updating...' : 'Publishing...')
                  : (isEditMode ? 'Update Posting' : 'Publish Job')}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default JobEditor;
