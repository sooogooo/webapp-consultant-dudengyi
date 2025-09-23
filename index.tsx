import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

declare global {
  function showApp(): void;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Call the function to transition from splash to app,
// ensuring it happens after the initial render.
showApp();