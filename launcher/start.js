// Starts every app's own dev server and the launcher in front of them (research R1).
// Each app keeps its own packages; the launcher forwards /apps/<app-name>/ to the app's server,
// so all apps open from one address and share the data stored in the browser.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { APPS } from './apps.js';

const children = [];
let stopping = false;

// Stop the app servers together with the launcher.
function stopAll(exitCode = 0) {
  stopping = true;
  children.forEach((child) => child.kill());
  process.exit(exitCode);
}

function run(name, folder, args) {
  // One command string: npx needs a shell on Windows; the arguments contain no spaces.
  const child = spawn(`npx vite ${args.join(' ')}`, { cwd: folder, stdio: 'inherit', shell: true });
  // If one server cannot start (e.g. its port is taken), stop everything with a clear message.
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(
        `\n${name} stopped (exit code ${code}). If a port is already in use, close the other ` +
          'terminal running the launcher or the app, then run "npm run dev" again.',
      );
      stopAll(1);
    }
  });
  children.push(child);
}

for (const app of APPS) {
  const folder = fileURLToPath(new URL(`../apps/${app.folder}/`, import.meta.url));
  if (!existsSync(`${folder}node_modules`)) {
    console.log(`Skipping ${app.name}: run "npm install" in apps/${app.folder} first.`);
    continue;
  }
  run(app.name, folder, ['--port', String(app.port), '--strictPort', '--base', `/apps/${app.folder}/`, '--clearScreen', 'false']);
}

run('Launcher', fileURLToPath(new URL('.', import.meta.url)), ['--clearScreen', 'false']);

process.on('SIGINT', () => stopAll());
process.on('SIGTERM', () => stopAll());
