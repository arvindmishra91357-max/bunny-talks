import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Mount React Root
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Register Service Worker for PWA capabilities
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('🐰 Bunny Talks ServiceWorker registered: ', registration.scope);
      })
      .catch((err) => {
        console.log('Bunny Talks ServiceWorker registration failed: ', err);
      });
  });
}
