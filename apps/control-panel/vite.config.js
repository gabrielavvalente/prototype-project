import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const appFolder = fileURLToPath(new URL('.', import.meta.url));
const sharedFolder = fileURLToPath(new URL('../../shared', import.meta.url));

export default defineConfig({
  plugins: [react()],
  // The app reads the theme and the platform data from the monorepo's shared/ folder.
  server: { port: 5174, fs: { allow: [appFolder, sharedFolder] } },
  // The shared platform rules are tested here too.
  test: { include: ['src/**/*.test.js', '../../shared/**/*.test.js'] },
});
