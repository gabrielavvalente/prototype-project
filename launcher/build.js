// Builds the launcher page and every app into one static site, launcher/dist/: the page at / and
// each app at /apps/<app-name>/, the same addresses as with "npm run dev", so the apps keep sharing
// the data stored in the browser. Used to host the prototype (e.g. on Netlify).

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { APPS } from './apps.js';

const launcherFolder = fileURLToPath(new URL('.', import.meta.url));
const dist = fileURLToPath(new URL('./dist/', import.meta.url));

function run(command, cwd) {
  console.log(`\n> ${command}   (in ${cwd})`);
  execSync(command, { cwd, stdio: 'inherit' });
}

run('npx vite build --outDir dist --emptyOutDir', launcherFolder);

for (const app of APPS) {
  const folder = fileURLToPath(new URL(`../apps/${app.folder}/`, import.meta.url));
  // Each app keeps its own exact-pinned packages (constitution, Monorepo Structure).
  if (!existsSync(`${folder}node_modules`)) run('npm ci', folder);
  run(`npx vite build --base /apps/${app.folder}/ --outDir "${dist}apps/${app.folder}" --emptyOutDir`, folder);
}

console.log(`\nDone: ${dist}`);
