import { localToday } from '../logic/actions.js';
import { countActions } from '../logic/eventList.js';
import ArchivedByReasonChart from './ArchivedByReasonChart.jsx';
import EventsByTypeChart from './EventsByTypeChart.jsx';

// The KPIs tab (review 2026-10-25): headline numbers, the events reported by type and the archived
// events by reason (003, third review). Open and Overdue actions come from the action plans (005 EL-12).
// archived: the Archived events matching the search and filters (hidden from the other counts).
export default function KpiOverview({ events, archived, kpis, onOpen }) {
  const actionCounts = countActions(events, localToday());
  const tiles = [
    { key: 'sip', label: 'Events with SIP', value: kpis.sip, hint: 'Reviewed as a serious incident potential' },
    { key: 'openActions', label: 'Open actions', value: actionCounts.open, hint: 'Deployed and not yet completed' },
    { key: 'overdueActions', label: 'Overdue actions', value: actionCounts.overdue, hint: 'Past their due date' },
    { key: 'open', label: 'Events in progress', value: kpis.open, hint: 'Submitted and not yet closed' },
    { key: 'archived', label: 'Archived events', value: archived.length, hint: 'Reviewed as not valid' },
  ];

  return (
    <section className="kpi-page" aria-label="Event overview">
      <div className="stat-tiles">
        {tiles.map((tile) => (
          <button key={tile.key} type="button" className="stat-tile stat-tile--link" onClick={() => onOpen(tile.key)}>
            <span className="stat-tile-label">{tile.label}</span>
            <strong className="stat-tile-value">{tile.value}</strong>
            <span className="stat-tile-hint">{tile.hint} · see the events</span>
          </button>
        ))}
      </div>
      <EventsByTypeChart events={events} />
      <ArchivedByReasonChart events={archived} />
    </section>
  );
}
