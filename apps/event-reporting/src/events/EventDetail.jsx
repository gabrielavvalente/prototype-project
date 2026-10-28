import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Paper, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { AttachmentPreview } from '../create/AttachmentInput.jsx';
import { findEvent, getByIndex } from '../data/db.js';
import { canEditEvent, getMenuItems, isEventVisible } from '../logic/access.js';
import { isCritical } from '../logic/display.js';
import CriticalBadges from './CriticalBadges.jsx';
import { describeEvent, describeImmediateAction } from '../logic/eventSummary.js';
import { findById, findLevelByCode, getLabel } from '../logic/lookups.js';
import { currentStep } from '../logic/review.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import { PillarTag, SeverityDots } from './EventCard.jsx';
import StatusBadge from './StatusBadge.jsx';
import SummaryList from './SummaryList.jsx';

function formatDateTime(isoText) {
  return isoText ? new Date(isoText).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}

// Created, submitted, review taken and completed, and last updated, oldest first.
function buildHistory(event, users) {
  const items = [{ label: `Created by ${getLabel(users, event.createdBy)}`, at: event.createdAt }];
  if (event.submittedAt) {
    items.push({ label: `Submitted — record number ${event.recordNumber}`, at: event.submittedAt });
  }
  const review = event.review;
  if (review?.claimedAt) {
    items.push({ label: `Review taken by ${getLabel(users, review.reviewerId)}`, at: review.claimedAt });
  }
  if (review?.reviewedAt) {
    const outcome = review.decision === 'invalid' ? `archived (${review.invalidReason})` : 'valid';
    items.push({ label: `Review completed — ${outcome}`, at: review.reviewedAt });
  }
  if (event.rca?.immediateActionsChangedAt) {
    const by = getLabel(users, event.rca.immediateActionsChangedBy);
    items.push({ label: `Immediate actions updated in the root cause analysis by ${by}`, at: event.rca.immediateActionsChangedAt });
  }
  if (event.actionPlan?.deployedAt) {
    items.push({ label: `Action plan deployed by ${getLabel(users, event.actionPlan.deployedBy)}`, at: event.actionPlan.deployedAt });
  }
  if (event.actionPlan?.completedAt) {
    items.push({ label: 'Action plan completed', at: event.actionPlan.completedAt });
  }
  for (const validation of event.validations ?? []) {
    const by = getLabel(users, validation.by);
    const label = validation.effective ? `Validation: effective — closed by ${by}` : `Validation: not effective — ${validation.reason} (${by})`;
    items.push({ label, at: validation.at });
  }
  if (event.optionalAnalysis?.startedAt) {
    items.push({ label: `Root cause analysis started by ${getLabel(users, event.optionalAnalysis.startedBy)}`, at: event.optionalAnalysis.startedAt });
  }
  if (event.rca?.completedAt) {
    items.push({ label: `Root cause analysis completed by ${getLabel(users, event.rca.completedBy)}`, at: event.rca.completedAt });
  }
  const known = items.map((item) => item.at);
  if (event.updatedAt && !known.includes(event.updatedAt)) {
    items.push({ label: `Last updated by ${getLabel(users, event.updatedBy)}`, at: event.updatedAt });
  }
  return items.sort((a, b) => a.at.localeCompare(b.at));
}

// Shown once, right after the event was saved from the form (FR-015).
export function SavedBanner({ saved, recordNumber, status, canCreate }) {
  const messages = {
    submit: (
      <>
        Event <strong>{recordNumber}</strong> was submitted
        {status === 'Closed' ? ' and closed right away (no other phase required)' : ''}. Its reviewers and the
        Managers of this plant have been alerted.
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
    <Alert color="green" variant="light" className="saved-banner" role="status">
      <Icon name="check" />
      <span>{messages[saved]}</span>
      {saved === 'submit' && canCreate && (
        <Link className="saved-banner-link" to="/events/new">
          Report another event
        </Link>
      )}
    </Alert>
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

// The event's header: pillar, level, status, critical badges, title and key facts. compact: the
// short version above the workflow steps (third review).
export function EventHeadCard({ event, compact = false }) {
  const { reference, organization, users } = useApp();
  const pillar = findById(reference, event.pillarId);
  const level = findLevelByCode(reference, event.levelCode);
  const reporter = findById(users, event.reporterId);
  const critical = isCritical(event);
  const locationPath = Object.values(event.location)
    .map((nodeId) => getLabel(organization, nodeId))
    .filter(Boolean)
    .join(' › ');

  return (
    <Paper
      component="section"
      withBorder
      shadow="xs"
      radius="md"
      p={compact ? 'md' : 'xl'}
      className={`card detail-head${compact ? ' detail-head--compact' : ''}${critical ? ' card--critical' : ''}`}
    >
      <div className="tag-row">
        <PillarTag pillar={pillar} />
        <Badge variant="light" color="blue">{event.levelCode}</Badge>
        <StatusBadge status={event.status} />
        <CriticalBadges event={event} />
      </div>
      <Title order={1}>{event.title || '(no title yet)'}</Title>
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
    </Paper>
  );
}

// Everything reported, section by section, with photos, immediate actions and the history.
export function EventSections({ event, attachments }) {
  const lists = useApp();
  const sections = describeEvent(event, lists, attachments.length).filter((section) => section.section !== 'classification');

  return (
    <>
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
              <Paper key={action.id} withBorder radius="md" p="md" className="card card--flat">
                <Title order={3} size="h4">
                  Immediate action {actionIndex + 1} <Badge color="teal" variant="light">COMPLETED</Badge>
                </Title>
                <SummaryList rows={describeImmediateAction(action, lists)} />
              </Paper>
            ))}
        </Collapsible>
      ))}

      <EventHistory event={event} />
    </>
  );
}

// Created, submitted, review taken and completed, last updated.
export function EventHistory({ event }) {
  const { users } = useApp();
  return (
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
  );
}

// Everything entered at creation, its photos and videos, its immediate actions and its history (FR-033, FR-045).
export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, context } = useApp();
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

  // A submitted event has one page: its workflow steps (003, third review). Right after a submit
  // it opens on Submission, with the confirmation banner.
  if (event.status !== 'Draft') {
    const step = location.state?.saved ? 'submission' : currentStep(event) ?? 'submission';
    return <Navigate to={`/events/${event.recordNumber}/steps/${step}`} replace state={location.state} />;
  }

  const editPath = `/events/${event.id}/edit`;

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
          status={location.state.status}
          canCreate={getMenuItems(user.role).includes('create-event')}
        />
      )}

      <EventHeadCard event={event} />
      <EventSections event={event} attachments={attachments} />

      <div className="bottom-bar">
        <Button component={Link} variant="default" to="/events">
          All events
        </Button>
        {canEditEvent(user, event) && (
          <Button component={Link} to={editPath}>
            <Icon name="edit" size={18} />
            Continue draft
          </Button>
        )}
      </div>
    </main>
  );
}
