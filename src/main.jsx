// main.jsx
// Developer: Greenshoes Team
// Entry point for the GreenShoes Admin Panel React application
//
// REQUIREMENT: "Single admin interface for product, inventory, and impact management"
// This is where the entire admin app gets bootstrapped - everything flows from here

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // Global styles including Tailwind and brand typography

// StrictMode helps catch potential issues during development
// Renders App into the root div in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);