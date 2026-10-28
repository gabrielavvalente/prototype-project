import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { getAll } from '../data/db.js';
import { getPillarTagClass } from '../logic/display.js';
import { alertContent, hasAlert } from '../logic/safetyCommunication.js';
import { canShare, sharedLines } from '../logic/sharingHub.js';
import ShareToHub from './ShareToHub.jsx';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// The Safety Alerts and published Safety Warnings of the context's plant, all pillars, newest
// first (SC-8). It reads every event of the plant: the documents carry no names (SC-3). A published
// Warning offers Share to Hub to those who may share it (SH-1).
export default function CommunicationsList() {
  const { context, organization, reference, user, users } = useApp();
  const [items, setItems] = useState(null);
  const [sharing, setSharing] = useState(null); // the event being shared

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

  // The shared event replaces its entries, so the card shows where it went at once.
  function shared(saved) {
    setSharing(null);
    setItems((current) => current.map((item) => (item.event.id === saved.id ? { ...item, event: saved } : item)));
  }

  return (
    <>
      <ul className="communication-list">
        {items.map(({ kind, event, at, content }) => {
          const shareable = kind === 'warning' && canShare(user, event, investigationGroups, users);
          return (
            <li key={`${kind}-${event.id}`} className={shareable ? 'communication-item--share' : undefined}>
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
              {shareable && (
                <div className="communication-card-share">
                  <span>
                    {sharedLines(event, organization).map((line) => (
                      <span key={line} className="communication-card-meta">
                        {line}
                      </span>
                    ))}
                  </span>
                  <Button type="button" variant="light" size="xs" onClick={() => setSharing(event)}>
                    Share to Hub
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {sharing && <ShareToHub event={sharing} onClose={() => setSharing(null)} onShared={shared} />}
    </>
  );
}
