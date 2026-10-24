import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const appFolder = fileURLToPath(new URL('.', import.meta.url));
const sharedFolder = fileURLToPath(new URL('../../shared', import.meta.url));

export default defineConfig({
  plugins: [react()],
  // The app reads the common theme from the monorepo's shared/ folder.
  server: { fs: { allow: [appFolder, sharedFolder] } },
});
