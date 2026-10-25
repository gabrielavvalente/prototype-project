import ArchivedByReasonChart from './ArchivedByReasonChart.jsx';
import EventsByTypeChart from './EventsByTypeChart.jsx';

// The KPIs tab (review 2026-10-25): headline numbers, the events reported by type and the archived
// events by reason (003, third review). Open actions stay at 0 until action plans exist.
// archived: the Archived events matching the search and filters (hidden from the other counts).
export default function KpiOverview({ events, archived, kpis, onOpen }) {
  const tiles = [
    { key: 'sip', label: 'Events with SIP', value: kpis.sip, hint: 'Submitted with serious incident potential' },
    { key: 'actions', label: 'Open actions', value: 0, hint: 'Counted once action plans are available' },
    { key: 'open', label: 'Events in progress', value: kpis.open, hint: 'Submitted and not yet closed' },
    { key: 'archived', label: 'Archived events', value: archived.length, hint: 'Reviewed as not valid' },
  ];

  return (
    <section className="kpi-page" aria-label="Event overview">
      <div className="stat-tiles">
        {tiles.map((tile) =>
          tile.key === 'actions' ? (
            <div key={tile.key} className="stat-tile">
              <span className="stat-tile-label">{tile.label}</span>
              <strong className="stat-tile-value">{tile.value}</strong>
              <span className="stat-tile-hint">{tile.hint}</span>
            </div>
          ) : (
            <button key={tile.key} type="button" className="stat-tile stat-tile--link" onClick={() => onOpen(tile.key)}>
              <span className="stat-tile-label">{tile.label}</span>
              <strong className="stat-tile-value">{tile.value}</strong>
              <span className="stat-tile-hint">{tile.hint} · see the events</span>
            </button>
          ),
        )}
      </div>
      <EventsByTypeChart events={events} />
      <ArchivedByReasonChart events={archived} />
    </section>
  );
}
