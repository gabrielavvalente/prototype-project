import { CRITICAL_PHASES, PHASE_LABELS, PHASES } from '../../../../shared/platform/workflow.js';

// The phases the critical row adds at one plant, the others crossed out (012 WF-10).
function CriticalPath({ level, plantName, result }) {
  const title = `Added at ${plantName} when the review flags ${level.flags}`;
  const nothing = CRITICAL_PHASES.every((phase) => !result[phase].required);
  return (
    <section className="event-path" aria-label={title}>
      <h2>{title}</h2>
      {nothing && <p className="field-hint">Nothing is added.</p>}
      <ol className="path-steps">
        {CRITICAL_PHASES.map((phase) =>
          result[phase].required ? (
            <li key={phase} className="path-step">
              {PHASE_LABELS[phase]}
            </li>
          ) : (
            <li key={phase} className="path-step path-step--skipped">
              <s>{PHASE_LABELS[phase]}</s>
              <span className="visually-hidden"> (not added)</span>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}

// The path an event of one level takes at one plant: Optional phases are crossed out (FR-011).
export default function EventPath({ level, plantName, result }) {
  if (level.critical) return <CriticalPath level={level} plantName={plantName} result={result} />;
  const onlySubmission = PHASES.every((phase) => phase === 'submission' || !result[phase].required);
  return (
    <section className="event-path" aria-label={`Path of a ${level.code} event at ${plantName}`}>
      <h2>
        Path of a {level.code} event at {plantName}
      </h2>
      <ol className="path-steps">
        {PHASES.map((phase) =>
          result[phase].required ? (
            <li key={phase} className="path-step">
              {PHASE_LABELS[phase]}
            </li>
          ) : (
            <li key={phase} className="path-step path-step--skipped">
              <s>{PHASE_LABELS[phase]}</s>
              <span className="visually-hidden"> (skipped)</span>
            </li>
          ),
        )}
        <li className="path-step path-step--end">{onlySubmission ? 'Closed after submission' : 'Closed'}</li>
      </ol>
    </section>
  );
}
