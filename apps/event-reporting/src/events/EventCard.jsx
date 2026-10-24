import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getPillarColorClass, getSeverityDots } from '../logic/display.js';
import { isSip } from '../logic/eventList.js';
import { findById, getLabel } from '../logic/lookups.js';
import Icon from '../shell/Icon.jsx';

export function SeverityDots({ levelCode }) {
  const dots = getSeverityDots(levelCode);
  if (dots === 0) return null;
  return (
    <span className={`severity-dots severity-dots--${dots}`} role="img" aria-label={`Severity ${dots} of 4`}>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function PillarTag({ pillar }) {
  return (
    <span className="tag tag--outline">
      <span className={`pillar-dot ${getPillarColorClass(pillar?.code)}`} aria-hidden="true" />
      {pillar?.label}
    </span>
  );
}

// One event card (Kanban view, FR-041): tags, record number, title, location, reporter, date.
export default function EventCard({ event, onQuickView }) {
  const { reference, organization, users } = useApp();
  const pillar = findById(reference, event.pillarId);
  const reporter = findById(users, event.reporterId);
  const critical = isSip(event) || getSeverityDots(event.levelCode) >= 3;
  const department = getLabel(organization, event.location.departmentId);

  return (
    <article className={`card event-card${critical ? ' card--critical' : ''}`}>
      <div className="event-card-top">
        <div className="tag-row">
          <PillarTag pillar={pillar} />
          <span className="tag tag--blue">{event.levelCode}</span>
          {isSip(event) && <span className="tag tag--red">SIP</span>}
        </div>
        <div className="event-card-corner">
          <SeverityDots levelCode={event.levelCode} />
          {onQuickView && (
            <button type="button" className="icon-button card-eye" onClick={() => onQuickView(event)}>
              <Icon name="eye" size={18} label={`Preview ${event.title || 'draft'}`} />
            </button>
          )}
        </div>
      </div>
      <p className="event-card-number">{event.recordNumber || 'Draft — no record number yet'}</p>
      <h2 className="event-card-title">
        <Link to={`/events/${event.recordNumber || event.id}`} className="stretched-link">
          {event.title || '(no title yet)'}
        </Link>
      </h2>
      {department && (
        <div className="tag-row">
          <span className="tag tag--outline">
            <Icon name="location" size={12} /> {department}
          </span>
        </div>
      )}
      <div className="event-card-bottom">
        <span className="person">
          <span className="avatar avatar--small" aria-hidden="true">
            {reporter?.avatar}
          </span>
          {reporter?.name}
        </span>
        <span className="field-hint">
          <Icon name="clock" size={14} /> {event.reportDate}
        </span>
      </div>
    </article>
  );
}
