// Small display rules from the design guideline (FR-039, FR-043).

// Level 1 → 4 dots (critical) … levels 4 and 5 → 1 dot (low); disease types have no level.
export function getSeverityDots(levelCode) {
  const match = /^(TF|EvE|SRE)([1-5])$/.exec(levelCode || '');
  if (!match) {
    return 0;
  }
  const level = Number(match[2]);
  return Math.max(1, 5 - level);
}

const PILLAR_COLOR_CLASSES = {
  'H&S': 'pillar-dot--hs',
  ENV: 'pillar-dot--env',
  IR: 'pillar-dot--ir',
  IH: 'pillar-dot--ih',
};

export function getPillarColorClass(pillarCode) {
  return PILLAR_COLOR_CLASSES[pillarCode] || '';
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
