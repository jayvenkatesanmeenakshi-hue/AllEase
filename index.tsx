import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  } catch (err) {
    console.error("AllEase: Hydration/Render failure", err);
  }
} else {
  console.error("AllEase: Critical error - Root element 'root' not found.");
}