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
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>
        {/* Brand */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#0f172a',
          fontWeight: 800,
          fontSize: '1.25rem',
          fontFamily: 'var(--font-display)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7, #6366f1)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800
          }}>
            J
          </div>
          JobBoard
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/jobs" style={{ fontWeight: 600, color: '#334155' }}>
            Browse Jobs
          </Link>

          {/* Role-Specific Links */}
          {isAuthenticated && isSeeker && (
            <>
              <Link to="/seeker/dashboard" style={{ fontWeight: 600, color: '#334155' }}>
                Dashboard
              </Link>
              <Link to="/seeker/applications" style={{ fontWeight: 600, color: '#334155' }}>
                My Applications
              </Link>
            </>
          )}

          {isAuthenticated && isEmployer && (
            <>
              <Link to="/employer/dashboard" style={{ fontWeight: 600, color: '#334155' }}>
                Dashboard
              </Link>
              <Link to="/employer/jobs" style={{ fontWeight: 600, color: '#334155' }}>
                My Jobs
              </Link>
              <Link to="/employer/jobs/create" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                + Post Job
              </Link>
            </>
          )}

          {/* Auth State Controls */}
          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '0.88rem' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.88rem' }}>
                Register
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '8px' }}>
              <div style={{
                background: '#f1f5f9',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isEmployer ? '#7e22ce' : '#059669'
                }} />
                {user.name} ({isEmployer ? 'Employer' : 'Seeker'})
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                Log Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
