/**
 * @file Footer.jsx
 * @description Global footer component displayed at the bottom of all application views.
 * Features brand identity, platform navigation links, account shortcuts, support sections,
 * and Ethiopian localized dedication copyright notes.
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 */
const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '56px 0 36px',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Main Footer Columns Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand Column: Logo, Brand Typography, and Tagline */}
          <div style={{ maxWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img
                src="/favicon.png"
                alt="Sira"
                style={{
                  width: '26px',
                  height: '26px',
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
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                ሥራ
              </span>
            </div>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.92rem',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Find work. Build what’s next.
            </p>
          </div>

          {/* Platform Links: Discover jobs, How it works, For employers */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '12px',
                fontWeight: 600,
              }}
            >
              Platform
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/jobs" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Discover jobs
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  How it works
                </a>
              </li>
              <li>
                <a href="/#for-employers" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  For employers
                </a>
              </li>
            </ul>
          </div>

          {/* Account Links: Sign in, Create account, My applications */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '12px',
                fontWeight: 600,
              }}
            >
              Account
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/login" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Create account
                </Link>
              </li>
              <li>
                <Link to="/seeker/applications" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  My applications
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links: Help and Contact */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '12px',
                fontWeight: 600,
              }}
            >
              Support
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Help</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Note: Copyright and Regional Motto */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>© 2026 Sira. All rights reserved.</div>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            Built for Ethiopia. Designed for opportunity.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

