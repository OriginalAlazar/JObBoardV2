import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isEmployer, isSeeker, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        {/* Brand: Sira / ሥራ */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text)',
            textDecoration: 'none',
          }}
        >
          <img
            src="/favicon.png"
            alt="Sira"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '1.45rem',
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            Sira
          </span>
          <span
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              paddingLeft: '2px',
            }}
          >
            ሥራ
          </span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link
            to="/jobs"
            style={{
              fontSize: '0.92rem',
              color: 'var(--text)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Discover
          </Link>

          <a
            href="/#how-it-works"
            style={{
              fontSize: '0.92rem',
              color: 'var(--text)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            How it works
          </a>

          {!isAuthenticated && (
            <a
              href="/#for-employers"
              style={{
                fontSize: '0.92rem',
                color: 'var(--text)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              For Employers
            </a>
          )}

          {/* Role-Specific Links */}
          {isAuthenticated && isSeeker && (
            <>
              <Link
                to="/seeker/dashboard"
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Workspace
              </Link>
              <Link
                to="/seeker/applications"
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                My Applications
              </Link>
            </>
          )}

          {isAuthenticated && isEmployer && (
            <>
              <Link
                to="/employer/dashboard"
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Workspace
              </Link>
              <Link
                to="/employer/jobs"
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Postings
              </Link>
              <Link
                to="/employer/jobs/create"
                className="btn btn-outline"
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                Post a job
              </Link>
            </>
          )}

          {/* Auth Controls */}
          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ padding: '7px 16px', fontSize: '0.88rem' }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ padding: '7px 16px', fontSize: '0.88rem' }}
              >
                Get started
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)',
                }}
              >
                {user.name} <span style={{ color: 'var(--border)' }}>·</span> {isEmployer ? 'Employer' : 'Candidate'}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              >
                Sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
