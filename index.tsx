import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './globals.css';

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  } catch (err) {
    console.error("AllEase: Initial mount failure", err);
  }
} else {
  console.error("AllEase: Critical error - Root element 'root' not found.");
}