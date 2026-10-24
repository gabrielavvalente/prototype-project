import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const repositoryFolder = fileURLToPath(new URL('..', import.meta.url));

// One server for the whole repository, so every app opens from the same address
// (e.g. /apps/control-panel/) and they all share the data stored in the browser.
// This page is served at /launcher/ because no file may sit at the repository root.
export default defineConfig({
  root: repositoryFolder,
  // Keep Vite's cache inside the launcher instead of the repository root.
  cacheDir: fileURLToPath(new URL('./node_modules/.vite', import.meta.url)),
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: '/launcher/',
    fs: { allow: [repositoryFolder] },
  },
});
