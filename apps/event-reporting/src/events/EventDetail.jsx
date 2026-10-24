import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { AttachmentPreview } from '../create/AttachmentInput.jsx';
import { SummaryList } from '../create/SummarySection.jsx';
import { findEvent, getByIndex } from '../data/db.js';
import { canEditEvent, isEventVisible } from '../logic/access.js';
import { describeEvent, describeImmediateAction } from '../logic/eventSummary.js';
import NotAllowed from '../shell/NotAllowed.jsx';

// Everything entered at creation, its photos and videos, and its immediate actions (FR-033).
export default function EventDetail() {
  const { id } = useParams();
  const lists = useApp();
  const { user, context } = lists;
  const [state, setState] = useState({ status: 'loading', event: null, attachments: [] });

  useEffect(() => {
    async function load() {
      const event = await findEvent(id);
      // Missing, out of scope and someone else's draft all look the same (contracts/routes.md).
      if (!event || !isEventVisible(user, context, event)) {
        setState({ status: 'notFound', event: null, attachments: [] });
        return;
      }
      const attachments = await getByIndex('attachments', 'eventId', event.id);
      setState({ status: 'ready', event, attachments });
    }
    load();
  }, [id, user, context]);

  const { status, event, attachments } = state;

  useEffect(() => {
    if (event) {
      document.title = `${event.recordNumber || 'Draft'} — Event Reporting`;
    }
  }, [event]);

  if (status === 'loading') return <p className="page">Loading…</p>;
  if (status === 'notFound') return <NotAllowed reason="notFound" />;

  return (
    <main className="page">
      <h1>{event.title}</h1>
      <p>
        <span className="status-badge">{event.status}</span> {event.recordNumber || 'Draft — no record number yet'}
      </p>
      {canEditEvent(user, event) && (
        <Link className="button button--primary" to={`/events/${event.recordNumber || event.id}/edit`}>
          {event.status === 'Draft' ? 'Continue draft' : 'Edit'}
        </Link>
      )}

      {describeEvent(event, lists, attachments.length).map((section) => (
        <section key={section.section} className="card" aria-labelledby={`detail-${section.section}`}>
          <h2 id={`detail-${section.section}`}>{section.title}</h2>
          <SummaryList rows={section.rows} />
          {section.section === 'general' && attachments.length > 0 && (
            <ul className="attachment-list detail-media">
              {attachments.map((attachment) => (
                <li key={attachment.id}>
                  <AttachmentPreview attachment={attachment} controls />
                </li>
              ))}
            </ul>
          )}
          {section.section === 'actions' &&
            event.immediateActions.map((action, index) => (
              <div key={action.id} className="card">
                <h3>Immediate action {index + 1}</h3>
                <SummaryList rows={describeImmediateAction(action, lists)} />
              </div>
            ))}
        </section>
      ))}
    </main>
  );
}
