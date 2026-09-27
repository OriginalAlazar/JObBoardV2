import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '480px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>
          Log in to access your applications or manage your jobs.
        </p>

        <div className="alert alert-info">
          <strong>Phase 1 Notice:</strong> Authentication schemas and bcrypt endpoints will be activated in Phase 2 &amp; 3.
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com" disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••" disabled />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }} disabled>
            Log In (Phase 2)
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
