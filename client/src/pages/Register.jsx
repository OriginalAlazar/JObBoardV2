import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const location = useLocation();
  const initialRole = location.state?.role === 'EMPLOYER' ? 'EMPLOYER' : 'JOB_SEEKER';

  const [role, setRole] = useState(initialRole);
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
      setError('Company or organization name is required for Employer accounts.');
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
    <div style={{ padding: '56px 0 96px', minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            padding: '36px',
            textAlign: 'left',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Sira · ሥራ
            </span>
            <h1
              style={{
                fontSize: '2rem',
                margin: '0 0 8px 0',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
              }}
            >
              Start your next chapter.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
              Create your Sira account and start discovering opportunities.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              background: 'var(--bg)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('JOB_SEEKER')}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: role === 'JOB_SEEKER' ? 'var(--surface)' : 'transparent',
                color: role === 'JOB_SEEKER' ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: role === 'JOB_SEEKER' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'background var(--duration-fast), color var(--duration-fast)',
              }}
            >
              I’m looking for work
            </button>
            <button
              type="button"
              onClick={() => setRole('EMPLOYER')}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: role === 'EMPLOYER' ? 'var(--surface)' : 'transparent',
                color: role === 'EMPLOYER' ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: role === 'EMPLOYER' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'background var(--duration-fast), color var(--duration-fast)',
              }}
            >
              I’m hiring
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
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder={role === 'EMPLOYER' ? 'Hana Alemu' : 'Samuel Tadesse'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            {role === 'EMPLOYER' && (
              <div className="form-group">
                <label className="form-label" htmlFor="register-company">
                  Company or organization name
                </label>
                <input
                  id="register-company"
                  type="text"
                  className="form-input"
                  placeholder="NEBO Tech"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="register-password" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
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
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              {/* Password Requirements Checklist with dots */}
              <div
                style={{
                  marginTop: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: hasMinLength ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                  <span style={{ color: hasMinLength ? 'var(--text)' : 'var(--text-muted)' }}>8+ characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: hasUpper ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                  <span style={{ color: hasUpper ? 'var(--text)' : 'var(--text-muted)' }}>Uppercase letter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: hasLower ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                  <span style={{ color: hasLower ? 'var(--text)' : 'var(--text-muted)' }}>Lowercase letter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: hasNumber && hasSpecial ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                  <span style={{ color: hasNumber && hasSpecial ? 'var(--text)' : 'var(--text-muted)' }}>Number &amp; symbol</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Confirm password
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
              style={{ width: '100%', padding: '12px', fontSize: '0.98rem', marginTop: '12px' }}
              disabled={loading || !isPasswordValid || password !== confirmPassword}
            >
              {loading ? 'Creating account...' : `Create ${role === 'EMPLOYER' ? 'Employer' : 'Candidate'} account →`}
            </button>
          </form>

          <div style={{ marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'left' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}>
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
