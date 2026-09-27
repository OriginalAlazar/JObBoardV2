import React from 'react';
import { Link } from 'react-router-dom';

const Jobs = () => {
  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Browse Jobs</h1>
        <p style={{ color: '#64748b' }}>Explore open opportunities posted by vetted employers.</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚀</div>
        <h3>Phase 1 Foundation Ready</h3>
        <p style={{ maxWidth: '500px', margin: '0 auto 20px', color: '#64748b' }}>
          Backend Express server and MongoDB are connected. Job listing, search, and filtering will be fully populated in Phase 2 &amp; 4.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Jobs;
