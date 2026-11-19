import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import App from './App';
import './index.css';

const rawBase = import.meta.env.BASE_URL || '/';
const basename = rawBase === './' || rawBase === '/' ? undefined : rawBase.replace(/\/$/, '');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${rawBase.endsWith('/') ? rawBase : `${rawBase}/`}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
