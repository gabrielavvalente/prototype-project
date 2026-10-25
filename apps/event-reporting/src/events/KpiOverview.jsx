import EventsByTypeChart from './EventsByTypeChart.jsx';

// The KPIs tab (review 2026-10-25): three headline numbers and the events reported by type.
// Open actions stay at 0 until action plans exist: immediate actions are always completed.
export default function KpiOverview({ events, kpis, onOpen }) {
  const tiles = [
    { key: 'sip', label: 'Events with SIP', value: kpis.sip, hint: 'Submitted with serious incident potential' },
    { key: 'actions', label: 'Open actions', value: 0, hint: 'Counted once action plans are available' },
    { key: 'open', label: 'Events in progress', value: kpis.open, hint: 'Submitted and not yet closed' },
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
    </section>
  );
}
