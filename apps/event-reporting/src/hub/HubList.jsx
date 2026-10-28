import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { getAll } from '../data/db.js';
import { getPillarTagClass } from '../logic/display.js';
import { CHECK_STATE_LABELS, receivedPackages } from '../logic/sharingHub.js';

const CLOSED = ['closedYes', 'no'];
const closedLabel = (state) => (state === 'closedYes' ? 'Could happen here' : 'Could not happen here');

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// The Safety Warnings other plants shared with the context's plant, newest first, with the state of
// the local check (SH-5). Everyone with an event role at the plant reads them.
export default function HubList() {
  const { context, organization, reference } = useApp();
  const [items, setItems] = useState(null);
  const plantName = getPlantName(organization, context.plantId);

  useEffect(() => {
    document.title = 'Sharing Hub — Event Reporting';
    getAll('events').then((events) => setItems(receivedPackages(events, context.plantId)));
  }, [context.plantId]);

  if (!items) return <p>Loading…</p>;
  if (items.length === 0) return <p className="empty-state">Nothing has been shared with {plantName} yet.</p>;

  const card = ({ event, pkg, receivedAt, state, closedAt }) => (
    <li key={event.id}>
      <Link className="communication-card" to={`/hub/${event.recordNumber}`}>
        <span className="communication-card-top">
          <strong>Safety Warning</strong>
          <span>from {getPlantName(organization, event.plantId)}</span>
          <span className={getPillarTagClass(reference.find((item) => item.id === event.pillarId)?.code)}>{pkg.content.pillar}</span>
          <span>{pkg.content.level}</span>
        </span>
        <span className="communication-card-meta">
          Shared on {formatDate(receivedAt)} ·{' '}
          <span className={`hub-state hub-state--${state}`}>
            {CLOSED.includes(state) ? `${closedLabel(state)} — closed on ${formatDate(closedAt)}` : CHECK_STATE_LABELS[state]}
          </span>
        </span>
        <span className="communication-card-text">{pkg.content.statement.split('\n')[0]}</span>
      </Link>
    </li>
  );
  const open = items.filter((item) => !CLOSED.includes(item.state));
  const closed = items.filter((item) => CLOSED.includes(item.state));

  // Open cases first, closed ones in the History (SH-5).
  return (
    <div className="hub-list">
      <section aria-labelledby="hub-open-title">
        <h2 id="hub-open-title">Open</h2>
        {open.length === 0 ? <p className="field-hint">No open case.</p> : <ul className="communication-list">{open.map(card)}</ul>}
      </section>
      <section aria-labelledby="hub-history-title">
        <h2 id="hub-history-title">History</h2>
        {closed.length === 0 ? <p className="field-hint">No closed case yet.</p> : <ul className="communication-list">{closed.map(card)}</ul>}
      </section>
    </div>
  );
}
