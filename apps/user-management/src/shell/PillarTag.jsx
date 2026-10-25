import { pillarColorKey } from './text.js';

// A pillar's name or code in its color, as in the other apps (shared/theme.css).
export default function PillarTag({ pillarId, children }) {
  return <span className={`pillar-tag pillar-tag--${pillarColorKey(pillarId)}`}>{children}</span>;
}
