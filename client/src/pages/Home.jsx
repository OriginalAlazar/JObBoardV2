import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await api.get('/jobs?limit=5&sort=newest');
        setRecentJobs(res.data.jobs || []);
        setTotalJobs(res.data.pagination?.total || 0);
      } catch {
        setRecentJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchRecentJobs();
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
      {/* Editorial Landing Hero: Left-Aligned with Intentional Whitespace */}
      <section style={{
        padding: '72px 0 64px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)'
      }}>
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto 0 0', paddingLeft: 'max(24px, calc((100vw - 1160px) / 2))' }}>
          
          <div style={{
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '16px'
          }}>
            KIRAY / JOBS
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.2rem)',
            fontWeight: 500,
            lineHeight: 1.08,
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            Work worth moving toward.
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: '560px',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            Discover curated opportunities from engineering teams and organizations building what comes next.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: '8px',
            maxWidth: '580px',
            marginBottom: '28px'
          }}>
            <input
              type="text"
              placeholder="Search by title, role, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.95rem', padding: '12px 16px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 22px', flexShrink: 0 }}>
              Search jobs →
            </button>
          </form>

          {/* Editorial Counter Line & Category Text Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '24px', fontSize: '0.9rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 500 }}>
              <span style={{ fontWeight: 700 }}>{totalJobs || '8'}</span> opportunities available
            </div>
            <span style={{ color: 'var(--border)' }}>|</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: 'var(--text-muted)' }}>
              <span>Disciplines:</span>
              {categories.map((cat, idx) => (
                <React.Fragment key={cat}>
                  <Link
                    to={`/jobs?category=${encodeURIComponent(cat)}`}
                    style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    {cat}
                  </Link>
                  {idx < categories.length - 1 && <span className="meta-separator">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Featured Opportunities Section: Flat List Rows (No Card Grids) */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Featured Opportunities</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                Positions open for immediate review and direct application
              </p>
            </div>
            <Link to="/jobs" style={{ fontSize: '0.92rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Explore all {totalJobs || ''} roles →
            </Link>
          </div>

          {loadingJobs ? (
            <div className="job-directory">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="job-row" style={{ opacity: 0.5 }}>
                  <div className="job-row-main" style={{ width: '100%' }}>
                    <div style={{ width: '30%', height: '18px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '45%', height: '12px', background: 'var(--border)', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="card" style={{ padding: '40px', color: 'var(--text-muted)' }}>
              No active postings available right now. Please check back shortly.
            </div>
          ) : (
            <div className="job-directory">
              {recentJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Editorial Platform Architecture Pillars (Left-Aligned, No Emojis, Thin Borders) */}
      <section style={{ padding: '48px 0 80px', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                01 / DISCOVERY
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Direct from employers</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Every position is published directly by authenticated recruiters and hiring managers. No scraped duplicates or third-party agencies.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                02 / WORKSPACE
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Transparent lifecycle</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Track the status of your submissions from submission through evaluation to final decision in an integrated candidate workspace.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                03 / SECURITY
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Zero surveillance</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Server-side sessions using HTTP-only cookies and automatic database TTL expiration. No trackers, telemetry, or third-party cookies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
