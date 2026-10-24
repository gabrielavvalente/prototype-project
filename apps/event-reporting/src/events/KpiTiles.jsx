// Headline counts above the list; clicking a tile applies its filter (FR-031).
export default function KpiTiles({ kpis, filters, onSelect }) {
  const tiles = [
    { key: 'total', label: 'Total Events', value: kpis.total, active: !filters.status && !filters.hpr },
    { key: 'open', label: 'Open Events', value: kpis.open, active: filters.status === 'Open' },
    { key: 'hpr', label: 'Events With HPR', value: kpis.withHpr, active: filters.hpr === 'yes' },
  ];
  return (
    <ul className="kpi-tiles">
      {tiles.map((tile) => (
        <li key={tile.key}>
          <button type="button" className="button kpi-tile" aria-pressed={tile.active} onClick={() => onSelect(tile.key)}>
            <span className="kpi-value">{tile.value}</span>
            <span>{tile.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
