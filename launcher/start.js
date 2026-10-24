// Starts every app's own dev server and the launcher in front of them (research R1).
// Each app keeps its own packages; the launcher forwards /apps/<app-name>/ to the app's server,
// so all apps open from one address and share the data stored in the browser.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { APPS } from './apps.js';

const children = [];

function run(folder, args) {
  // One command string: npx needs a shell on Windows; the arguments contain no spaces.
  const child = spawn(`npx vite ${args.join(' ')}`, { cwd: folder, stdio: 'inherit', shell: true });
  children.push(child);
  return child;
}

for (const app of APPS) {
  const folder = fileURLToPath(new URL(`../apps/${app.folder}/`, import.meta.url));
  if (!existsSync(`${folder}node_modules`)) {
    console.log(`Skipping ${app.name}: run "npm install" in apps/${app.folder} first.`);
    continue;
  }
  run(folder, ['--port', String(app.port), '--strictPort', '--base', `/apps/${app.folder}/`, '--clearScreen', 'false']);
}

run(fileURLToPath(new URL('.', import.meta.url)), ['--clearScreen', 'false']);

// Stop the app servers together with the launcher.
function stopAll() {
  children.forEach((child) => child.kill());
  process.exit();
}
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
