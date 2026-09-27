import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [healthStatus, setHealthStatus] = useState({ loading: true, connected: false });
  const navigate = useNavigate();

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get('/health');
        setHealthStatus({ loading: false, connected: res.data.database?.connected });
      } catch {
        setHealthStatus({ loading: false, connected: false });
      }
    };
    checkBackend();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const categories = [
    'Technology',
    'Healthcare',
    'Finance & Banking',
    'Marketing',
    'Design',
    'Sales',
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #eef2ff 100%)',
        borderBottom: '1px solid #bae6fd',
        padding: '70px 0 60px',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          {/* Live System Health Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            padding: '4px 14px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            border: '1px solid #cbd5e1',
            marginBottom: '20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: healthStatus.loading ? '#f59e0b' : (healthStatus.connected ? '#10b981' : '#ef4444')
            }} />
            {healthStatus.loading
              ? 'Checking backend connection...'
              : (healthStatus.connected ? 'Express API & MongoDB Atlas Online' : 'Connecting to API server...')}
          </div>

          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            color: '#0f172a'
          }}>
            Connect with Top Employers &amp; Open Positions
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#334155',
            marginBottom: '36px',
            lineHeight: 1.6
          }}>
            A modern MERN recruitment platform offering role-based applicant management, fast search, and instant status tracking.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: '10px',
            background: '#ffffff',
            padding: '8px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.06)'
          }}>
            <input
              type="text"
              placeholder="Search by job title, skill, company, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px 18px',
                fontSize: '1rem',
                fontFamily: 'var(--font-sans)',
                color: '#0f172a'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 28px' }}>
              Search Jobs
            </button>
          </form>

          {/* Popular Categories */}
          <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, alignSelf: 'center' }}>
              Popular:
            </span>
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/jobs?category=${encodeURIComponent(cat)}`}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 500
                }}
              >
                {cat}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Feature Highlights Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</div>
              <h3 style={{ marginBottom: '8px' }}>Powerful Job Discovery</h3>
              <p style={{ color: '#64748b' }}>
                Search by keyword, filter by category, employment type, or salary range with server-side pagination.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📄</div>
              <h3 style={{ marginBottom: '8px' }}>Seamless Application Flow</h3>
              <p style={{ color: '#64748b' }}>
                Submit customized cover letters and external resume links. Track your application status from Pending to Accepted in real-time.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💼</div>
              <h3 style={{ marginBottom: '8px' }}>Employer Recruitment Hub</h3>
              <p style={{ color: '#64748b' }}>
                Post jobs, review applicant submissions, manage statuses, and view recruitment metrics on an intuitive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
