import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      padding: '32px 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem', marginBottom: '4px' }}>
            Kiray Recruitment Platform
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Direct employer job board built with React, Express, and MongoDB
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
          HTTP-only sessions · Cookie authentication · Zero trackers
        </div>
      </div>
    </footer>
  );
};

export default Footer;
