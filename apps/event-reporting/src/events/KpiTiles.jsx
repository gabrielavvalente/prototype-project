const CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'My events' },
  { key: 'open', label: 'Open' },
  { key: 'sip', label: 'With SIP' },
  { key: 'drafts', label: 'Drafts' },
];

// The row of counter chips above the list; one is always selected (FR-031).
export default function KpiTiles({ kpis, selected, onSelect }) {
  return (
    <div className="kpi-row" role="group" aria-label="Quick filters">
      {CHIPS.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="chip chip--counter"
          aria-pressed={selected === chip.key}
          onClick={() => onSelect(chip.key)}
        >
          <strong>{kpis[chip.key]}</strong>
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
}
