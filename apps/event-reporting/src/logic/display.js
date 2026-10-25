// Small display rules from the design guideline (FR-039, FR-043).

import { criticalLabels } from './severity.js';

// Red display: the review's classification once reviewed; before that, the submission's SIP
// answer or a serious level, as before.
export function isCritical(event) {
  if (event.review?.decision) return criticalLabels(event).length > 0;
  return criticalLabels(event).length > 0 || getSeverityDots(event.levelCode) >= 3;
}

// Level 1 → 4 dots (critical) … levels 4 and 5 → 1 dot (low); disease types have no level.
export function getSeverityDots(levelCode) {
  const match = /^(TF|EvE|SRE)([1-5])$/.exec(levelCode || '');
  if (!match) {
    return 0;
  }
  const level = Number(match[2]);
  return Math.max(1, 5 - level);
}

// Pillar colors come from shared/theme.css, so every app shows a pillar the same way.
const PILLAR_COLOR_KEYS = {
  'H&S': 'hs',
  ENV: 'env',
  IR: 'ir',
  IH: 'ih',
};

// "hs", "env"… for the pillar classes of shared/theme.css and the pillar chips.
export function getPillarColorKey(pillarCode) {
  return PILLAR_COLOR_KEYS[pillarCode] || '';
}

export function getPillarColorClass(pillarCode) {
  return PILLAR_COLOR_KEYS[pillarCode] ? `pillar-dot--${PILLAR_COLOR_KEYS[pillarCode]}` : '';
}

export function getPillarTagClass(pillarCode) {
  return PILLAR_COLOR_KEYS[pillarCode] ? `pillar-tag pillar-tag--${PILLAR_COLOR_KEYS[pillarCode]}` : 'pillar-tag';
}

// The pillar's color as a CSS value, for charts.
export function getPillarColor(pillarCode) {
  return PILLAR_COLOR_KEYS[pillarCode] ? `var(--color-pillar-${PILLAR_COLOR_KEYS[pillarCode]})` : 'var(--color-muted)';
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(isoText, now = new Date()) {
  const elapsed = now - new Date(isoText);
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < 30 * DAY) return `${Math.floor(elapsed / DAY)}d ago`;
  return new Date(isoText).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
