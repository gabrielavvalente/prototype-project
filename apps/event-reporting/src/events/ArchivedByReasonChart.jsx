import { useApp } from '../AppContext.js';
import { getPillarColor, getPillarTagClass } from '../logic/display.js';
import { countArchivedByReason } from '../logic/eventList.js';
import { findById } from '../logic/lookups.js';
import { INVALID_REASONS } from '../logic/review.js';
import { familiesInScope } from './EventsByTypeChart.jsx';
import StackedColumnChart from './StackedColumnChart.jsx';

// Archived events: one column per invalidation reason, split by type in pillar colors (003, third
// review). The legend names the types, so a type is never told by color alone.
export default function ArchivedByReasonChart({ events }) {
  const { reference, context } = useApp();
  const families = familiesInScope(reference, context);
  const pillarCodeOf = (family) => findById(reference, family.pillarId)?.code;
  const rows = countArchivedByReason(events, INVALID_REASONS, families);
  const columns = rows.map(({ reason, total, families: byFamily }) => ({
    key: reason,
    caption: reason,
    total,
    label: <span className="bar-chart-label bar-chart-label--strong">{reason}</span>,
    segments: byFamily.map(({ family, count }) => ({
      key: family.code,
      label: `${family.code} — ${family.label}`,
      count,
      color: getPillarColor(pillarCodeOf(family)),
    })),
  }));
  const legend = (
    <ul className="chart-legend" aria-label="Types">
      {families.map((family) => (
        <li key={family.id}>
          <span className={getPillarTagClass(pillarCodeOf(family))}>{family.code}</span> {family.label}
        </li>
      ))}
    </ul>
  );
  const table = {
    headers: ['Reason', 'Type', 'Events'],
    rows: rows.flatMap(({ reason, families: byFamily }) =>
      byFamily.map(({ family, count }) => [reason, `${family.code} — ${family.label}`, count]),
    ),
  };

  return (
    <StackedColumnChart
      title="Archived events by reason"
      subtitle="Events reviewed as not valid in your scope, split by type."
      columns={columns}
      legend={legend}
      table={table}
    />
  );
}
