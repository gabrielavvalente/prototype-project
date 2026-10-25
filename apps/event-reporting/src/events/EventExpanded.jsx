import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { AttachmentPreview } from '../create/AttachmentInput.jsx';
import { getByIndex } from '../data/db.js';
import { canEditEvent } from '../logic/access.js';
import { getLabel } from '../logic/lookups.js';
import { canStartReview, currentStep } from '../logic/review.js';
import Icon from '../shell/Icon.jsx';
import SummaryList from './SummaryList.jsx';

function ActionSubCard({ action, index }) {
  const { reference, users } = useApp();
  const performers = action.performedByIds.map((id) => getLabel(users, id)).join(', ');
  return (
    <li className="action-subcard">
      <div className="action-subcard-top">
        <strong>
          {index + 1}. {action.description}
        </strong>
        <span className="tag tag--teal">COMPLETED</span>
      </div>
      <span className="field-hint">
        {getLabel(reference, action.pillarId)} · {getLabel(reference, action.priority)} priority · Done on{' '}
        {action.completionDate}
      </span>
      {performers && <span className="field-hint">By {performers}</span>}
    </li>
  );
}

// The extra information shown when a List row or a Kanban card is expanded (FR-027).
export default function EventExpanded({ event }) {
  const { user, reference, organization } = useApp();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    getByIndex('attachments', 'eventId', event.id).then(setPhotos);
  }, [event.id]);

  const locationPath = Object.values(event.location)
    .map((nodeId) => getLabel(organization, nodeId))
    .filter(Boolean)
    .join(' › ');
  const path = `/events/${event.recordNumber || event.id}`;
  // Only what the row or card does not already show (level, date and title are there).
  const facts = [{ label: 'Location', value: locationPath }];
  if (event.eventTime) {
    facts.push({ label: 'Event time', value: event.eventTime });
  }
  facts.push(
    { label: 'Shift', value: getLabel(reference, event.shiftMoment) },
    { label: 'Task type', value: getLabel(reference, event.taskTypeId) },
  );
  if (event.riskQuestion) {
    facts.push({ label: `${event.riskQuestion.type}?`, value: event.riskQuestion.answer ? 'Yes' : 'No' });
  }

  return (
    <div className="event-expanded">
      <p className="section-label">Description</p>
      <p className="event-expanded-description">{event.description || '—'}</p>
      <SummaryList rows={facts} />
      {photos.length > 0 && (
        <ul className="attachment-list event-expanded-photos">
          {photos.map((photo) => (
            <li key={photo.id} className="attachment-item">
              <AttachmentPreview attachment={photo} />
            </li>
          ))}
        </ul>
      )}
      <p className="section-label">Immediate actions ({event.immediateActions.length})</p>
      {event.immediateActions.length === 0 ? (
        <p className="field-hint">No immediate action recorded.</p>
      ) : (
        <ul className="action-subcards">
          {event.immediateActions.map((action, index) => (
            <ActionSubCard key={action.id} action={action} index={index} />
          ))}
        </ul>
      )}
      <div className="event-expanded-links">
        {canStartReview(user, event) && (
          <Link className="button button--primary" to={`${path}/steps/review`}>
            <Icon name="check" size={18} /> Review
          </Link>
        )}
        {/* A submitted event opens on its current workflow step; a draft opens its page. */}
        <Link className={`button${canStartReview(user, event) ? '' : ' button--primary'}`} to={event.status === 'Draft' ? path : `${path}/steps/${currentStep(event) ?? 'submission'}`}>
          Open event
        </Link>
        {event.status === 'Draft' && canEditEvent(user, event) && (
          <Link className="button" to={`${path}/edit`}>
            <Icon name="edit" size={18} /> Continue draft
          </Link>
        )}
      </div>
    </div>
  );
}
