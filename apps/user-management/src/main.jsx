import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '../../../shared/theme.css';
import './app.css';
import App from './App.jsx';

const theme = createTheme({
  fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  headings: { fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif" },
  primaryColor: 'blue',
  colors: {
    blue: [
      '#e8f1fa',
      '#d2e4f5',
      '#a9cbea',
      '#7db0dd',
      '#5899d2',
      '#3d88ca',
      '#2a78c2',
      '#2469aa',
      '#1f62a3',
      '#195486',
    ],
  },
  defaultRadius: 'md',
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
