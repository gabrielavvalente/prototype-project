import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getAll } from '../data/db.js';
import { getPillarTagClass } from '../logic/display.js';
import { alertContent, hasAlert } from '../logic/safetyCommunication.js';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// The Safety Alerts and published Safety Warnings of the context's plant, all pillars, newest
// first (SC-8). It reads every event of the plant: the documents carry no names (SC-3).
export default function CommunicationsList() {
  const { context, organization, reference } = useApp();
  const [items, setItems] = useState(null);

  useEffect(() => {
    document.title = 'Safety communications — Event Reporting';
    getAll('events').then((events) => {
      const ofPlant = events.filter((event) => event.plantId === context.plantId && hasAlert(event));
      const list = ofPlant.flatMap((event) => {
        const alert = alertContent(event, { organization, reference });
        const entries = [{ kind: 'alert', event, at: event.review.reviewedAt, content: alert }];
        if (event.safetyWarning?.publishedAt) {
          entries.push({ kind: 'warning', event, at: event.safetyWarning.publishedAt, content: event.safetyWarning.content });
        }
        return entries;
      });
      setItems(list.sort((a, b) => (b.at || '').localeCompare(a.at || '')));
    });
  }, [context.plantId, organization, reference]);

  if (!items) return <p>Loading…</p>;
  if (items.length === 0) return <p className="empty-state">No safety communications yet.</p>;

  return (
    <ul className="communication-list">
      {items.map(({ kind, event, at, content }) => (
        <li key={`${kind}-${event.id}`}>
          <Link className="communication-card" to={`/communications/${event.recordNumber}/${kind}`}>
            <span className="communication-card-top">
              <strong>{kind === 'alert' ? 'Safety Alert' : 'Safety Warning'}</strong>
              <span className={getPillarTagClass(reference.find((item) => item.id === event.pillarId)?.code)}>{content.pillar}</span>
              <span>{content.level}</span>
            </span>
            <span className="communication-card-meta">
              {content.record} · {at ? formatDate(at) : ''}
            </span>
            <span className="communication-card-text">{content.statement.split('\n')[0]}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
