import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '../../../shared/theme.css';
import './app.css';
import { MantineProvider, createTheme } from '@mantine/core';
import App from './App.jsx';

const theme = createTheme({
  fontFamily: 'Poppins, sans-serif',
  primaryColor: 'blue',
  colors: {
    blue: [
      '#e8f1fa', '#d8e8f7', '#b7d3ef', '#91bde5', '#6aa6db',
      '#4b94d2', '#2a78c2', '#1f62a3', '#174c80', '#10365c',
    ],
    teal: [
      '#e3f5f3', '#c9ebe8', '#a0dbd5', '#71c9c0', '#43b5aa',
      '#249f95', '#12857e', '#0d6b65', '#08534f', '#063c39',
    ],
  },
  primaryShade: 6,
  defaultRadius: 'md',
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
