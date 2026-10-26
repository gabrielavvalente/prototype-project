import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { findEvent, getByIndex } from '../data/db.js';
import { canReadCommunication, canSeeWarning, hasAlert } from '../logic/safetyCommunication.js';
import CommunicationView from './CommunicationView.jsx';

const NOT_AVAILABLE = 'This safety communication is not available.';

// The Safety Alert or the Safety Warning of an event on its own page (SC-3, SC-9): readable by the
// plant, also by people who cannot open the event.
export default function CommunicationPage() {
  const { record, kind } = useParams();
  const { user, users } = useApp();
  const [event, setEvent] = useState(undefined);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    async function load() {
      const found = await findEvent(record);
      setEvent(found || null);
      if (found) setAttachments(await getByIndex('attachments', 'eventId', found.id));
    }
    load();
  }, [record]);

  useEffect(() => {
    document.title = `${kind === 'warning' ? 'Safety Warning' : 'Safety Alert'} — ${record} — Event Reporting`;
  }, [kind, record]);

  if (event === undefined) return <p className="page">Loading…</p>;

  const readable =
    event &&
    ['alert', 'warning'].includes(kind) &&
    hasAlert(event) &&
    canReadCommunication(user, event) &&
    (kind === 'alert' || canSeeWarning(user, event, investigationGroups, users));
  if (!readable) {
    return (
      <main className="page">
        <p className="message message--warning">{NOT_AVAILABLE}</p>
      </main>
    );
  }

  return (
    <main className="page communication-page">
      <CommunicationView event={event} kind={kind} attachments={attachments} onSaved={setEvent} showEventLink />
    </main>
  );
}
