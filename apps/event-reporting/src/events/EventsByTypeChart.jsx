import { useApp } from '../AppContext.js';
import { getPillarColor, getPillarTagClass } from '../logic/display.js';
import { countByFamilyAndLevel } from '../logic/eventList.js';
import { findById, getReferenceList } from '../logic/lookups.js';
import StackedColumnChart from './StackedColumnChart.jsx';

// How much of the pillar color each level keeps: the first (most serious) level is the darkest.
const LEVEL_SHADES = [100, 80, 64, 50, 38];

function levelColor(pillarCode, index) {
  return `color-mix(in srgb, ${getPillarColor(pillarCode)} ${LEVEL_SHADES[index] ?? 38}%, var(--color-surface))`;
}

// The types (families) shown: all, or those of the chosen pillar.
export function familiesInScope(reference, context) {
  return getReferenceList(reference, 'family').filter((family) => !context.pillarId || family.pillarId === context.pillarId);
}

// Reported events by type: one column per family, split by level (review 2026-10-25). Columns
// wear their pillar color, as everywhere else; levels are shades of it, darker = more serious.
export default function EventsByTypeChart({ events }) {
  const { reference, context } = useApp();
  const rows = countByFamilyAndLevel(events, familiesInScope(reference, context), getReferenceList(reference, 'level'));
  const columns = rows.map(({ family, total, levels }) => {
    const pillarCode = findById(reference, family.pillarId)?.code;
    return {
      key: family.id,
      caption: family.code,
      total,
      label: (
        <>
          <span className={getPillarTagClass(pillarCode)}>{family.code}</span>
          <span className="bar-chart-label">{family.label}</span>
        </>
      ),
      segments: levels.map(({ level, count }, index) => ({
        key: level.code,
        label: `${level.code} — ${level.label}`,
        count,
        color: levelColor(pillarCode, index),
      })),
    };
  });
  const table = {
    headers: ['Type', 'Level', 'Events'],
    rows: rows.flatMap(({ family, levels }) =>
      levels.map(({ level, count }) => [`${family.code} — ${family.label}`, `${level.code} — ${level.label}`, count]),
    ),
  };

  return (
    <StackedColumnChart
      title="Reported events by type"
      subtitle="Submitted events in your scope, split by level. Darker shades are more serious levels."
      columns={columns}
      table={table}
    />
  );
}
