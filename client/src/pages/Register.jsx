import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '480px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Create an Account</h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>
          Join as a Job Seeker or Employer.
        </p>

        <div className="alert alert-info">
          <strong>Phase 1 Notice:</strong> User registration with bcrypt password hashing will be activated in Phase 2 &amp; 3.
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '16px' }}>
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
