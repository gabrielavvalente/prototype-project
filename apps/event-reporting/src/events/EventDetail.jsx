import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { AttachmentPreview } from '../create/AttachmentInput.jsx';
import { findEvent, getByIndex } from '../data/db.js';
import { canEditEvent, getMenuItems, isEventVisible } from '../logic/access.js';
import { getSeverityDots } from '../logic/display.js';
import { isSip } from '../logic/eventList.js';
import { describeEvent, describeImmediateAction } from '../logic/eventSummary.js';
import { findById, findLevelByCode, getLabel } from '../logic/lookups.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import { PillarTag, SeverityDots } from './EventCard.jsx';
import StatusBadge from './StatusBadge.jsx';
import SummaryList from './SummaryList.jsx';

function formatDateTime(isoText) {
  return isoText ? new Date(isoText).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}

// Created, submitted and last updated, oldest first.
function buildHistory(event, users) {
  const items = [{ label: `Created by ${getLabel(users, event.createdBy)}`, at: event.createdAt }];
  if (event.submittedAt) {
    items.push({ label: `Submitted — record number ${event.recordNumber}`, at: event.submittedAt });
  }
  if (event.updatedAt && event.updatedAt !== event.createdAt && event.updatedAt !== event.submittedAt) {
    items.push({ label: `Last updated by ${getLabel(users, event.updatedBy)}`, at: event.updatedAt });
  }
  return items;
}

// Shown once, right after the event was saved from the form (FR-015).
function SavedBanner({ saved, recordNumber, canCreate }) {
  const messages = {
    submit: (
      <>
        Event <strong>{recordNumber}</strong> was submitted. The Managers of this plant have been alerted.
      </>
    ),
    draft: 'Your draft was saved on this device. Only you can see it.',
    changes: (
      <>
        Event <strong>{recordNumber}</strong> was updated.
      </>
    ),
  };
  return (
    <div className="message message--success saved-banner" role="status">
      <Icon name="check" />
      <span>{messages[saved]}</span>
      {saved === 'submit' && canCreate && (
        <Link className="button button--link" to="/events/new">
          Report another event
        </Link>
      )}
    </div>
  );
}

function Collapsible({ title, open = false, children }) {
  return (
    <details className="card collapsible" open={open}>
      <summary>
        <h2>{title}</h2>
        <Icon name="chevronDown" />
      </summary>
      <div className="collapsible-body">{children}</div>
    </details>
  );
}

// Everything entered at creation, its photos and videos, its immediate actions and its history (FR-033, FR-045).
export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const lists = useApp();
  const { user, context, reference, organization, users } = lists;
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

  const pillar = findById(reference, event.pillarId);
  const level = findLevelByCode(reference, event.levelCode);
  const reporter = findById(users, event.reporterId);
  const critical = isSip(event) || getSeverityDots(event.levelCode) >= 3;
  const sections = describeEvent(event, lists, attachments.length).filter((section) => section.section !== 'classification');
  const locationPath = Object.values(event.location)
    .map((nodeId) => getLabel(organization, nodeId))
    .filter(Boolean)
    .join(' › ');
  const editPath = `/events/${event.recordNumber || event.id}/edit`;

  return (
    <main className="page page--with-bar">
      <div className="detail-topbar">
        <button type="button" className="icon-button" onClick={() => navigate('/events')}>
          <Icon name="back" label="Back to events" />
        </button>
        <span>{event.recordNumber || 'Draft'}</span>
      </div>

      {location.state?.saved && (
        <SavedBanner
          saved={location.state.saved}
          recordNumber={location.state.recordNumber}
          canCreate={getMenuItems(user.role).includes('create-event')}
        />
      )}

      <section className={`card detail-head${critical ? ' card--critical' : ''}`}>
        <div className="tag-row">
          <PillarTag pillar={pillar} />
          <span className="tag tag--blue">{event.levelCode}</span>
          <StatusBadge status={event.status} />
          {isSip(event) && <span className="tag tag--red">SIP</span>}
        </div>
        <h1>{event.title || '(no title yet)'}</h1>
        <dl className="facts-grid">
          <div>
            <dt className="section-label">Level</dt>
            <dd>
              <SeverityDots levelCode={event.levelCode} /> {level ? `${level.code} — ${level.label}` : '—'}
            </dd>
          </div>
          <div>
            <dt className="section-label">Reporter</dt>
            <dd className="person">
              <span className="avatar avatar--small" aria-hidden="true">
                {reporter?.avatar}
              </span>
              {reporter?.name}
            </dd>
          </div>
          <div>
            <dt className="section-label">When</dt>
            <dd>
              {event.reportDate} {event.eventTime}
            </dd>
          </div>
          {event.riskQuestion && (
            <div>
              <dt className="section-label">Could this be a {event.riskQuestion.type}?</dt>
              <dd>{event.riskQuestion.answer ? 'Yes' : 'No'}</dd>
            </div>
          )}
          <div className="facts-grid-wide">
            <dt className="section-label">Location</dt>
            <dd>
              {getLabel(organization, event.plantId)} › {locationPath || '—'}
            </dd>
          </div>
        </dl>
      </section>

      {sections.map((section, index) => (
        <Collapsible key={section.section} title={section.title} open={index < 2}>
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
            event.immediateActions.map((action, actionIndex) => (
              <div key={action.id} className="card card--flat">
                <h3>
                  Immediate action {actionIndex + 1} <span className="tag tag--teal">COMPLETED</span>
                </h3>
                <SummaryList rows={describeImmediateAction(action, lists)} />
              </div>
            ))}
        </Collapsible>
      ))}

      <Collapsible title="History" open>
        <ol className="timeline">
          {buildHistory(event, users).map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <span className="field-hint">{formatDateTime(item.at)}</span>
            </li>
          ))}
        </ol>
      </Collapsible>

      <div className="bottom-bar">
        <Link className="button" to="/events">
          All events
        </Link>
        {canEditEvent(user, event) && (
          <Link className="button button--primary" to={editPath}>
            <Icon name="edit" size={18} />
            {event.status === 'Draft' ? 'Continue draft' : 'Edit'}
          </Link>
        )}
      </div>
    </main>
  );
}
