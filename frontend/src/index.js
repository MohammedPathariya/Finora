// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 1) Grab the <div id="root"> from public/index.html
const container = document.getElementById('root');

// 2) Create a root.
const root = ReactDOM.createRoot(container);

// 3) Render your app!
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);