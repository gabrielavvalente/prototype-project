import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Paper, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { findEvent } from '../data/db.js';
import { isEventVisible } from '../logic/access.js';
import { describeEvent } from '../logic/eventSummary.js';
import { STEP_LABELS, STEPS, stepStates } from '../logic/review.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import ReviewStep from './ReviewStep.jsx';
import StatusBadge from './StatusBadge.jsx';
import SummaryList from './SummaryList.jsx';

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

// The event's workflow page (review 2026-10-25): the steps menu on one side, the chosen step on
// the other. Submission shows what was reported; Review is done here; later steps come later.
export default function EventSteps() {
  const { id, step } = useParams();
  const navigate = useNavigate();
  const lists = useApp();
  const { user, context } = lists;
  const [event, setEvent] = useState(undefined);

  useEffect(() => {
    findEvent(id).then((found) => setEvent(found && found.status !== 'Draft' && isEventVisible(user, context, found) ? found : null));
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
        <Link to={`/events/${event.recordNumber}`}>{event.recordNumber}</Link>
        <StatusBadge status={event.status} />
      </div>
      <Title order={1} className="steps-title">{event.title}</Title>

      <div className="steps-layout">
        <StepsMenu event={event} activeStep={step} />
        <Paper component="section" withBorder radius="md" p="xl" className="card steps-content" aria-labelledby="step-title">
          <Title order={2} size="h3" id="step-title">{STEP_LABELS[step]}</Title>
          {!available && (
            <Alert color="gray" variant="light">
              {state === 'skipped' ? 'This step is not required for this event.' : 'This step has not been reached yet.'}
            </Alert>
          )}
          {available && step === 'submission' &&
            describeEvent(event, lists, event.attachmentIds.length)
              .filter((section) => section.section !== 'actions')
              .map((section) => (
                <div key={section.section} className="steps-section">
                  <h3>{section.title}</h3>
                  <SummaryList rows={section.rows} />
                </div>
              ))}
          {available && step === 'review' && <ReviewStep event={event} onSaved={setEvent} />}
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
