/**
 * @file Home.jsx
 * @description Public Landing Page / Homepage of Sira.
 * Features:
 *  - Hero headline with Ethiopian career mission statement
 *  - Live search bar (title, skill, company keyword + location filters) routing to `/jobs`
 *  - Real-time preview of the 5 newest job listings
 *  - Industry category quick browse grid
 *  - "How Sira Works" multi-step workflow walkthrough
 *  - Dedicated employer hiring recruitment CTA banner.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';

/**
 * Home Component
 */
const Home = () => {
  // Search bar input state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('Addis Ababa, Ethiopia');
  
  // Real-time job statistics & latest listings state
  const [recentJobs, setRecentJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const navigate = useNavigate();

  /**
   * Fetch 5 newest jobs on initial page load to populate the hero listings preview
   */
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

  /**
   * handleSearch
   * Formats search parameters into URL query strings and forwards user to the `/jobs` catalog view
   */
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (locationTerm.trim() && locationTerm !== 'Addis Ababa, Ethiopia') {
      params.append('location', locationTerm.trim());
    }
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Primary job sectors showcased in the category grid
  const categories = [
    {
      title: 'Technology',
      description: 'Software, data, IT & engineering',
    },
    {
      title: 'Business & Finance',
      description: 'Accounting, finance, operations & consulting',
    },
    {
      title: 'Design & Creative',
      description: 'Design, content, media & marketing',
    },
    {
      title: 'Sales & Customer Service',
      description: 'Sales, support & customer success',
    },
    {
      title: 'Engineering',
      description: 'Construction, infrastructure & technical roles',
    },
    {
      title: 'Administration',
      description: 'Operations, HR, administration & coordination',
    },
  ];


  return (
    <div>
      {/* 1. HERO SECTION */}
      <section
        style={{
          padding: '80px 0 64px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div className="container" style={{ maxWidth: '920px', margin: '0 auto 0 0', paddingLeft: 'max(24px, calc((100vw - 1160px) / 2))' }}>
          
          <div
            style={{
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}
          >
            OPPORTUNITIES ACROSS ETHIOPIA
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.4rem)',
              fontWeight: 600,
              lineHeight: 1.08,
              marginBottom: '18px',
              color: 'var(--text)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '-0.02em',
            }}
          >
            Find work worth moving toward.
          </h1>

          <p
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-muted)',
              maxWidth: '620px',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}
          >
            Discover opportunities from companies and organizations looking for people like you. Search, apply, and keep track of your journey — all in one place.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
            <Link to="/jobs" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Explore opportunities
            </Link>
            <Link to="/register" state={{ role: 'EMPLOYER' }} className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              I'm hiring
            </Link>
          </div>

          {/* Search Inputs Grid */}
          <form
            onSubmit={handleSearch}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
              gap: '12px',
              maxWidth: '720px',
              marginBottom: '36px',
            }}
          >
            <div>
              <label htmlFor="hero-search" style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Role, skill, or company
              </label>
              <input
                id="hero-search"
                type="text"
                placeholder="Search by job title, skill, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.92rem', padding: '10px 14px' }}
              />
            </div>

            <div>
              <label htmlFor="hero-location" style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Location
              </label>
              <input
                id="hero-location"
                type="text"
                placeholder="Addis Ababa, Ethiopia"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.92rem', padding: '10px 14px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ height: '42px', padding: '0 24px', whiteSpace: 'nowrap' }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Hero Supporting Statistics */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '40px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text)',
                  display: 'block',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                {totalJobs > 0 ? `${totalJobs}+` : '248+'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Open opportunities
              </span>
            </div>

            <div>
              <span
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text)',
                  display: 'block',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                82
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Companies hiring
              </span>
            </div>

            <div>
              <span
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text)',
                  display: 'block',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                12
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Job categories
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FEATURED OPPORTUNITIES */}
      <section style={{ padding: '72px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ marginBottom: '32px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              OPPORTUNITIES
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2
                  style={{
                    fontSize: '2.1rem',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.01em',
                  }}
                >
                  See where your next step could take you.
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                  Explore roles from growing companies and established organizations across Ethiopia.
                </p>
              </div>

              <Link
                to="/jobs"
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                View all opportunities →
              </Link>
            </div>
          </div>

          {/* Directory list rows */}
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
            <div style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
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

      {/* 3. CATEGORIES SECTION */}
      <section style={{ padding: '72px 0', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              EXPLORE BY FIELD
            </span>
            <h2
              style={{
                fontSize: '2.1rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Something for every direction.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.title}
                to={`/jobs?category=${encodeURIComponent(cat.title)}`}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  background: 'var(--bg)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color var(--duration-fast), background var(--duration-fast)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.15rem',
                    margin: '0 0 6px 0',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  {cat.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW SIRA WORKS */}
      <section id="how-it-works" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              HOW IT WORKS
            </span>
            <h2
              style={{
                fontSize: '2.1rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              From looking to landing.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  marginBottom: '12px',
                }}
              >
                01 — Discover
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Find opportunities that fit.
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                Search by role, skill, company, location, or category and discover opportunities that match what you're looking for.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  marginBottom: '12px',
                }}
              >
                02 — Apply
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Put yourself forward.
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                Submit your application directly through Sira with your information, cover letter, and resume.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  marginBottom: '12px',
                }}
              >
                03 — Move forward
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Follow your progress.
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                Keep track of your applications and see when an employer reviews or updates your application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOR EMPLOYERS & FOR JOB SEEKERS SPLIT */}
      <section id="for-employers" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '64px',
            }}
          >
            {/* For Employers */}
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                FOR EMPLOYERS
              </span>
              <h2
                style={{
                  fontSize: '2rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.01em',
                }}
              >
                Meet the people behind the potential.
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Create job opportunities, reach qualified candidates, and manage applications from one focused workspace.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.98rem', color: 'var(--text)', marginBottom: '2px' }}>
                    Publish opportunities
                  </strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Create and manage job listings with the information candidates need.
                  </span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.98rem', color: 'var(--text)', marginBottom: '2px' }}>
                    Manage applicants
                  </strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Review applications and keep your hiring process organized.
                  </span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.98rem', color: 'var(--text)', marginBottom: '2px' }}>
                    Track your hiring activity
                  </strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    See your active jobs and application activity from one dashboard.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/register" state={{ role: 'EMPLOYER' }} className="btn btn-primary">
                  Start hiring →
                </Link>
                <a href="#how-it-works" className="btn btn-secondary">
                  Learn how it works
                </a>
              </div>
            </div>

            {/* For Job Seekers */}
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                FOR CANDIDATES
              </span>
              <h2
                style={{
                  fontSize: '2rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.01em',
                }}
              >
                Your career is more than a job title.
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Sira helps you discover opportunities, apply with confidence, and keep your applications organized as you move toward your next role.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                  <span className="status-dot dot-accepted" /> Search vetted opportunities
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                  <span className="status-dot dot-accepted" /> Apply directly with resume and statement
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                  <span className="status-dot dot-accepted" /> Track application review stages live
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                  <span className="status-dot dot-accepted" /> Manage candidate profile and history
                </div>
              </div>

              <Link to="/jobs" className="btn btn-primary">
                Explore opportunities →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & LOCAL IDENTITY */}
      <section style={{ padding: '72px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto 0 0', paddingLeft: 'max(24px, calc((100vw - 1160px) / 2))' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            BUILT FOR THE LOCAL JOB MARKET
          </span>
          <h2
            style={{
              fontSize: '2.2rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              margin: '0 0 14px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Made with Ethiopia in mind.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
            Sira is designed around the way candidates and employers actually search, connect, and move through the hiring process in Ethiopia — with a simple experience that keeps the focus on people and opportunities.
          </p>
        </div>
      </section>

      {/* 7. VISUAL SHOWCASE: APPLICATION TRACKING & HIRING WORKSPACE */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '40px',
            }}
          >
            {/* Seeker Application Tracking Visual Showcase */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '32px',
                background: 'var(--bg)',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                STAY IN THE LOOP
              </span>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: '0 0 8px 0' }}>
                Know where you stand.
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
                Your applications shouldn't disappear into a black box. Sira keeps your application history organized so you can see what you've submitted and where each application stands.
              </p>

              {/* Interactive Showcase Mockup */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Software Engineer</div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>NEBO Tech</div>
                  </div>
                  <span className="badge status-reviewed">
                    <span className="status-dot dot-reviewed" /> Reviewed
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ color: 'var(--text)' }}>Applied</span>
                  <span>→</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Reviewed</span>
                  <span>→</span>
                  <span>Decision</span>
                </div>
              </div>
            </div>

            {/* Employer Workspace Showcase */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '32px',
                background: 'var(--bg)',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                YOUR HIRING WORKSPACE
              </span>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: '0 0 8px 0' }}>
                Everything you need to manage your opportunities.
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
                Review applications, evaluate candidates, and update statuses from a clean operational dashboard.
              </p>

              {/* Employer Metrics Showcase */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Active jobs</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>08</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Applications</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>126</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Open positions</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>05</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Sarah Mekonnen · Frontend Developer</span>
                    <span className="badge status-reviewed">Reviewed</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Daniel Tadesse · Backend Engineer</span>
                    <span className="badge status-pending">Pending</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Hana Alemu · Product Designer</span>
                    <span className="badge status-accepted">Accepted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <div className="container" style={{ maxWidth: '780px', margin: '0 auto 0 0', paddingLeft: 'max(24px, calc((100vw - 1160px) / 2))' }}>
          <h2
            style={{
              fontSize: '2.4rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Your next opportunity is somewhere ahead.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Start exploring opportunities or create your first job listing today.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/jobs" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.98rem' }}>
              Find opportunities
            </Link>
            <Link to="/register" state={{ role: 'EMPLOYER' }} className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.98rem' }}>
              Post a job
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
