/**
 * @file main.jsx
 * @description Frontend application entry point.
 * Initializes the React 18 Concurrent Root, imports the global design system (index.css),
 * and mounts the root <App /> component inside the DOM container with <StrictMode> enabled.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Mount React application into the #root element defined in index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode activates additional development checks and logs warnings for side-effects */}
    <App />
  </StrictMode>,
);

