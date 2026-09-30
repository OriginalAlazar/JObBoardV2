/**
 * @file Loading.jsx
 * @description Reusable loading spinner component.
 * Displays a lightweight animated CSS spinner accompanied by customizable status text
 * during asynchronous network fetches, auth checks, and route transitions.
 */

import React from 'react';

/**
 * Loading Component
 * 
 * @param {object} props - Component props
 * @param {string} [props.message='Loading...'] - Text message displayed beneath spinner
 */
const Loading = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      minHeight: '260px'
    }}>
      {/* Animated Circular Spinner Element */}
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #0284c7',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '16px'
      }} />
      {/* Descriptive loading message */}
      <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
        {message}
      </p>
      {/* Inline Keyframes for continuous 360-degree rotation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;

