import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { AttachmentPreview } from '../create/AttachmentInput.jsx';
import { SummaryList } from '../create/SummarySection.jsx';
import { getByIndex } from '../data/db.js';
import { isHpr } from '../logic/eventList.js';
import { findLevelByCode, getLabel } from '../logic/lookups.js';

// A preview of one event over the list, so the list keeps its place (FR-027).
export default function QuickView({ event, onClose }) {
  const { reference, organization, users } = useApp();
  const [firstPhoto, setFirstPhoto] = useState(null);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current.focus();
    getByIndex('attachments', 'eventId', event.id).then((attachments) => {
      setFirstPhoto(attachments.find((item) => item.mimeType.startsWith('image/')) || null);
    });
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [event, onClose]);

  const level = findLevelByCode(reference, event.levelCode);
  const rows = [
    { label: 'Record number', value: event.recordNumber || 'Draft' },
    { label: 'Status', value: event.status },
    { label: 'Classification', value: `${getLabel(reference, event.pillarId)} · ${level ? `${level.code} — ${level.label}` : ''}` },
    { label: 'HPR', value: isHpr(event) ? 'Yes' : 'No' },
    { label: 'Location', value: [event.location.departmentId, event.location.workshopId, event.location.workstationId].map((id) => getLabel(organization, id)).filter(Boolean).join(' › ') },
    { label: 'Reporter', value: getLabel(users, event.reporterId) },
    { label: 'Report date', value: `${event.reportDate} ${event.eventTime}` },
    { label: 'Immediate actions', value: String(event.immediateActions.length) },
  ];

  return (
    <div className="side-panel-backdrop" onClick={onClose}>
      <aside
        className="side-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="side-panel-header">
          <h2 id="quick-view-title" tabIndex={-1} ref={headingRef}>
            {event.title || '(no title yet)'}
          </h2>
          <button type="button" className="button" onClick={onClose}>
            Close
          </button>
        </div>
        {firstPhoto && (
          <div className="detail-media">
            <AttachmentPreview attachment={firstPhoto} />
          </div>
        )}
        <SummaryList rows={rows} />
        <div className="button-row">
          <Link className="button button--primary" to={`/events/${event.recordNumber || event.id}`}>
            Open event
          </Link>
        </div>
      </aside>
    </div>
  );
}
