import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Paper, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { findEvent, getByIndex } from '../data/db.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { canEditEvent, getMenuItems, isEventVisible } from '../logic/access.js';
import { canOpenOptionalPlan } from '../logic/actionPlan.js';
import { communicationStates } from '../logic/safetyCommunication.js';
import { STEP_LABELS, STEPS, stepStates } from '../logic/review.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import { EventForm } from '../create/EventForm.jsx';
import CommunicationView from '../communications/CommunicationView.jsx';
import { EventHeadCard, EventHistory, EventSections, SavedBanner } from './EventDetail.jsx';
import ActionPlanStep from './ActionPlanStep.jsx';
import ReviewStep from './ReviewStep.jsx';
import RootCauseStep from './RootCauseStep.jsx';
import ValidationStep from './ValidationStep.jsx';

const STATE_HINTS = { done: 'Done', current: 'Current step', upcoming: 'Not reached yet', skipped: 'Not required', optional: 'Optional' };

// The documents that open beside the menu, like steps (SC-10).
const COMMUNICATION_LABELS = { alert: 'Safety Alert', warning: 'Safety Warning' };

// The steps menu: steps already reached open, an Optional Actions step opens for the plan's owners
// (005 AP-3); the others are shown but disabled.
function StepsMenu({ event, activeStep, canOpenOptional }) {
  const { user, users } = useApp();
  const path = `/events/${event.recordNumber}/steps`;
  return (
    <nav className="steps-menu" aria-label="Workflow steps">
      <ol>
        {stepStates(event).map(({ step, state }, index) => {
          const content = (
            <>
              <span className={`step-marker step-marker--${state}`} aria-hidden="true">
                {state === 'done' ? <Icon name="check" size={14} /> : index + 1}
              </span>
              <span className="step-text">
                <strong>{STEP_LABELS[step]}</strong>
                <span className="field-hint">{STATE_HINTS[state]}</span>
              </span>
            </>
          );
          const open = state === 'done' || state === 'current' || (state === 'optional' && canOpenOptional);
          return (
            <li key={step}>
              {open ? (
                <Link
                  to={`${path}/${step}`}
                  className={`step-link step-link--${state}`}
                  aria-current={step === activeStep ? 'step' : undefined}
                >
                  {content}
                </Link>
              ) : (
                <span className={`step-link step-link--${state}`} aria-disabled="true">
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {/* The Safety Alert and Safety Warning: available ones open here, the others are greyed with
          when they will be (SC-10). */}
      <h3 className="steps-menu-heading" id="communications-title">
        Communications
      </h3>
      <ul aria-labelledby="communications-title">
        {communicationStates(user, event, investigationGroups, users).map((item) => {
          const content = (
            <>
              <span className={`step-marker step-marker--${item.open ? 'available' : 'unavailable'}`} aria-hidden="true">
                <Icon name="file" size={14} />
              </span>
              <span className="step-text">
                <strong>{item.label}</strong>
                <span className="field-hint">{item.hint}</span>
              </span>
            </>
          );
          return (
            <li key={item.kind}>
              {item.open ? (
                <Link
                  to={`${path}/${item.kind}`}
                  className="step-link step-link--available"
                  aria-current={item.kind === activeStep ? 'step' : undefined}
                >
                  {content}
                </Link>
              ) : (
                <span className="step-link step-link--unavailable" aria-disabled="true">
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// What was reported: editable in place by those who may edit it (while Open), read-only for the
// others — there is no Edit button (third review).
function SubmissionStep({ event, attachments }) {
  const { user } = useApp();
  if (canEditEvent(user, event)) {
    return (
      <>
        <EventForm key={event.id} embedded />
        <EventHistory event={event} />
      </>
    );
  }
  return <EventSections event={event} attachments={attachments} />;
}

// The page of a submitted event (003): its header, then the steps menu beside the chosen step.
// Submission shows what was reported; Review is done here; later steps come later. Every link to a
// submitted event opens this page (third review), and Back returns to the event list.
export default function EventSteps() {
  const { id, step } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, users, context } = useApp();
  const [event, setEvent] = useState(undefined);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    async function load() {
      const found = await findEvent(id);
      if (!found || found.status === 'Draft' || !isEventVisible(user, context, found)) {
        setEvent(null);
        return;
      }
      setAttachments(await getByIndex('attachments', 'eventId', found.id));
      setEvent(found);
    }
    load();
  }, [id, user, context]);

  useEffect(() => {
    if (event) document.title = `${STEP_LABELS[step] ?? COMMUNICATION_LABELS[step] ?? 'Steps'} — ${event.recordNumber} — Event Reporting`;
  }, [event, step]);

  if (event === undefined) return <p className="page">Loading…</p>;
  if (event === null || (!STEPS.includes(step) && !COMMUNICATION_LABELS[step])) return <NotAllowed reason="notFound" />;
  const communication = COMMUNICATION_LABELS[step]
    ? communicationStates(user, event, investigationGroups, users).find((item) => item.kind === step)
    : null;

  const state = communication ? null : stepStates(event).find((item) => item.step === step).state;
  const canOpenOptional = canOpenOptionalPlan(user, event, investigationGroups, users);
  const available = state === 'done' || state === 'current' || (state === 'optional' && canOpenOptional);

  return (
    <main className="page page--wide steps-page">
      <div className="detail-topbar">
        <button type="button" className="icon-button" onClick={() => navigate('/events')}>
          <Icon name="back" label="Back to events" />
        </button>
        <span>{event.recordNumber}</span>
      </div>

      {location.state?.saved && (
        <SavedBanner
          saved={location.state.saved}
          recordNumber={location.state.recordNumber}
          status={location.state.status}
          canCreate={getMenuItems(user.role).includes('create-event')}
        />
      )}

      <EventHeadCard event={event} compact />

      <div className="steps-layout">
        <StepsMenu event={event} activeStep={step} canOpenOptional={canOpenOptional} />
        <Paper component="section" withBorder radius="md" p="xl" className="card steps-content" aria-labelledby="step-title">
          <Title order={2} size="h3" id="step-title">{STEP_LABELS[step] ?? COMMUNICATION_LABELS[step]}</Title>
          {communication && !communication.open && (
            <Alert color="gray" variant="light">
              {communication.hint}.
            </Alert>
          )}
          {communication?.open && (
            <CommunicationView key={`${event.id}-${step}`} event={event} kind={step} attachments={attachments} onSaved={setEvent} />
          )}
          {!communication && !available && (
            <Alert color="gray" variant="light">
              {state === 'skipped' || state === 'optional' ? 'This step is not required for this event.' : 'This step has not been reached yet.'}
            </Alert>
          )}
          {available && step === 'submission' && <SubmissionStep event={event} attachments={attachments} />}
          {/* A new form for each event: going from one event's steps to another's keeps this page. */}
          {available && step === 'review' && <ReviewStep key={event.id} event={event} onSaved={setEvent} />}
          {available && step === 'rootCause' && <RootCauseStep key={event.id} event={event} onSaved={setEvent} />}
          {available && step === 'actions' && <ActionPlanStep key={event.id} event={event} onSaved={setEvent} />}
          {available && step === 'validation' && <ValidationStep key={event.id} event={event} onSaved={setEvent} />}
        </Paper>
      </div>
    </main>
  );
}
