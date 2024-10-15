import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Polyfill for ResizeObserver warning
const resizeObserverLoopError = () => {
  let resizeObserverErr = false;

  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation();
      resizeObserverErr = true;
    }
  });

  const originalResizeObserver = ResizeObserver.prototype.observe;
  ResizeObserver.prototype.observe = function (...args) {
    if (!resizeObserverErr) {
      originalResizeObserver.apply(this, args);
    }
  };
};

resizeObserverLoopError(); // Invoke the polyfill

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
