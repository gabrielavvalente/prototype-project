// Label / value pairs, used by the event detail and the quick view.
export default function SummaryList({ rows }) {
  return (
    <dl className="summary-list">
      {rows.map((row) => (
        <div key={row.label} style={{ display: 'contents' }}>
          <dt>{row.label}</dt>
          <dd>{row.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
