import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

/**
 * Application Entry Point
 * =====================
 * 
 * Renders the root application component with React 18's createRoot API.
 * Includes:
 * - Strict Mode for development best practices
 * - Web Vitals reporting for performance monitoring
 */

// Get root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

// Create root
const root = createRoot(container);

// Render app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Report web vitals
reportWebVitals(console.log);
