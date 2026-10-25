// Sets the common browser-tab icon. Imported by each app's entry like theme.css, so Vite gives the
// icon's right address both through the launcher and in a build.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import iconUrl from './favicon.svg';

const link = document.querySelector('link[rel="icon"]') || document.head.appendChild(document.createElement('link'));
link.rel = 'icon';
link.type = 'image/svg+xml';
link.href = iconUrl;
