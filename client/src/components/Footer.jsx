import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '36px 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '4px' }}>
            MERN Job Board Platform
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            WEB II Academic Capstone &bull; Built with React, Express, and MongoDB
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
          Server-Side Sessions &bull; HTTP-Only Cookies &bull; MongoDB TTL
        </div>
      </div>
    </footer>
  );
};

export default Footer;
