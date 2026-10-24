import { PHASE_LABELS, PHASES } from '../../../../shared/platform/workflow.js';

// The path an event of one level takes at one plant: Optional phases are crossed out (FR-011).
export default function EventPath({ level, plantName, result }) {
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
