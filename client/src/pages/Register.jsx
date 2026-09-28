import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('JOB_SEEKER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (role === 'EMPLOYER' && !company.trim()) {
      setError('Company name is required for Employer accounts.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet all security complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        company: role === 'EMPLOYER' ? company.trim() : undefined,
      });

      const destination = res.user?.role === 'EMPLOYER' ? '/employer/dashboard' : '/seeker/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px 0 80px', minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card" style={{ padding: '36px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Create an Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              Join the platform to discover opportunities or hire talent.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'var(--bg-surface-elevated)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            border: '1px solid var(--border-strong)'
          }}>
            <button
              type="button"
              onClick={() => setRole('JOB_SEEKER')}
              style={{
                padding: '10px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: role === 'JOB_SEEKER' ? 'var(--primary)' : 'transparent',
                color: role === 'JOB_SEEKER' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'var(--transition)'
              }}
            >
              🔍 Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole('EMPLOYER')}
              style={{
                padding: '10px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: role === 'EMPLOYER' ? 'var(--primary)' : 'transparent',
                color: role === 'EMPLOYER' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'var(--transition)'
              }}
            >
              🏢 Employer / Recruiter
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder={role === 'EMPLOYER' ? 'Jane Smith (HR Manager)' : 'John Doe'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            {role === 'EMPLOYER' && (
              <div className="form-group">
                <label className="form-label" htmlFor="register-company">
                  Company Name <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  id="register-company"
                  type="text"
                  className="form-input"
                  placeholder="Acme Technologies Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email Address <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="register-password" style={{ marginBottom: 0 }}>
                  Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 8 characters with upper, lower, number, special"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              {/* Password Requirements Checklist */}
              <div style={{
                marginTop: '8px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}>
                <span style={{ color: hasMinLength ? 'var(--accent-green)' : undefined }}>
                  {hasMinLength ? '✓' : '•'} 8+ characters
                </span>
                <span style={{ color: hasUpper ? 'var(--accent-green)' : undefined }}>
                  {hasUpper ? '✓' : '•'} Uppercase letter
                </span>
                <span style={{ color: hasLower ? 'var(--accent-green)' : undefined }}>
                  {hasLower ? '✓' : '•'} Lowercase letter
                </span>
                <span style={{ color: hasNumber && hasSpecial ? 'var(--accent-green)' : undefined }}>
                  {hasNumber && hasSpecial ? '✓' : '•'} Number &amp; symbol
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Confirm Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <small style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  Passwords do not match
                </small>
              )}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '12px' }}
              disabled={loading || !isPasswordValid || password !== confirmPassword}
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'EMPLOYER' ? 'Employer' : 'Job Seeker'}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
