import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { APPS } from './apps.js';

const launcherFolder = fileURLToPath(new URL('.', import.meta.url));
const sharedFolder = fileURLToPath(new URL('../shared', import.meta.url));

// The launcher page at http://localhost:5173/ and, behind it, every app at /apps/<app-name>/.
// One address lets the apps share the data stored in the browser (research R1).
const proxy = Object.fromEntries(
  APPS.map((app) => [`/apps/${app.folder}`, { target: `http://localhost:${app.port}`, ws: true }]),
);

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy,
    fs: { allow: [launcherFolder, sharedFolder] },
  },
  // The built site (npm run build) has the apps in dist/apps/: nothing to forward.
  preview: { port: 4173, strictPort: true, proxy: {} },
});
