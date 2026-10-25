import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Paper, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { findEvent, getByIndex } from '../data/db.js';
import { canEditEvent, getMenuItems, isEventVisible } from '../logic/access.js';
import { STEP_LABELS, STEPS, stepStates } from '../logic/review.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import { EventForm } from '../create/EventForm.jsx';
import { EventHeadCard, EventHistory, EventSections, SavedBanner } from './EventDetail.jsx';
import ReviewStep from './ReviewStep.jsx';

const STATE_HINTS = { done: 'Done', current: 'Current step', upcoming: 'Not reached yet', skipped: 'Not required' };

// The steps menu: steps already reached open; the others are shown but disabled.
function StepsMenu({ event, activeStep }) {
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
          const open = state === 'done' || state === 'current';
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
  const { user, context } = useApp();
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
    if (event) document.title = `${STEP_LABELS[step] ?? 'Steps'} — ${event.recordNumber} — Event Reporting`;
  }, [event, step]);

  if (event === undefined) return <p className="page">Loading…</p>;
  if (event === null || !STEPS.includes(step)) return <NotAllowed reason="notFound" />;

  const state = stepStates(event).find((item) => item.step === step).state;
  const available = state === 'done' || state === 'current';

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
        <StepsMenu event={event} activeStep={step} />
        <Paper component="section" withBorder radius="md" p="xl" className="card steps-content" aria-labelledby="step-title">
          <Title order={2} size="h3" id="step-title">{STEP_LABELS[step]}</Title>
          {!available && (
            <Alert color="gray" variant="light">
              {state === 'skipped' ? 'This step is not required for this event.' : 'This step has not been reached yet.'}
            </Alert>
          )}
          {available && step === 'submission' && <SubmissionStep event={event} attachments={attachments} />}
          {/* A new form for each event: going from one event's steps to another's keeps this page. */}
          {available && step === 'review' && <ReviewStep key={event.id} event={event} onSaved={setEvent} />}
          {available && !['submission', 'review'].includes(step) && (
            <Alert color="blue" variant="light">
              {STEP_LABELS[step]} comes in a later version of the prototype.
            </Alert>
          )}
        </Paper>
      </div>
    </main>
  );
}
