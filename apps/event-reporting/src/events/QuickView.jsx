import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { AttachmentPreview } from '../create/AttachmentInput.jsx';
import { SummaryList } from '../create/SummarySection.jsx';
import { getByIndex } from '../data/db.js';
import { isHpr } from '../logic/eventList.js';
import { findLevelByCode, getLabel } from '../logic/lookups.js';
import Sheet from '../shell/Sheet.jsx';
import StatusBadge from './StatusBadge.jsx';

// A preview of one event over the list, so the list keeps its place (FR-027).
export default function QuickView({ event, onClose }) {
  const { reference, organization, users } = useApp();
  const [firstPhoto, setFirstPhoto] = useState(null);

  useEffect(() => {
    getByIndex('attachments', 'eventId', event.id).then((attachments) => {
      setFirstPhoto(attachments.find((item) => item.mimeType.startsWith('image/')) || null);
    });
  }, [event]);

  const level = findLevelByCode(reference, event.levelCode);
  const location = [event.location.departmentId, event.location.workshopId, event.location.workstationId]
    .map((id) => getLabel(organization, id))
    .filter(Boolean)
    .join(' › ');
  const rows = [
    { label: 'Record number', value: event.recordNumber || 'Draft' },
    { label: 'Classification', value: `${getLabel(reference, event.pillarId)} · ${level ? `${level.code} — ${level.label}` : ''}` },
    { label: 'HPR', value: isHpr(event) ? 'Yes' : 'No' },
    { label: 'Location', value: location },
    { label: 'Reporter', value: getLabel(users, event.reporterId) },
    { label: 'Report date', value: `${event.reportDate} ${event.eventTime}` },
    { label: 'Immediate actions', value: String(event.immediateActions.length) },
  ];

  return (
    <Sheet
      title={event.title || '(no title yet)'}
      onClose={onClose}
      footer={
        <Link className="button button--primary button--block" to={`/events/${event.recordNumber || event.id}`}>
          Open event
        </Link>
      }
    >
      <div className="tag-row quick-view-status">
        <StatusBadge status={event.status} />
      </div>
      {firstPhoto && (
        <div className="detail-media">
          <AttachmentPreview attachment={firstPhoto} />
        </div>
      )}
      <SummaryList rows={rows} />
    </Sheet>
  );
}
