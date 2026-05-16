import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { FlowProvider } from './lib/flowStore.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FlowProvider>
        <App />
      </FlowProvider>
    </BrowserRouter>
  </React.StrictMode>
);
