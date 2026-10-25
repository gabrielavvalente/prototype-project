import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '../../../shared/theme.css';
import '../../../shared/favicon.js';
import './app.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        primaryColor: 'blue',
        primaryShade: 6,
        defaultRadius: 'md',
      }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
