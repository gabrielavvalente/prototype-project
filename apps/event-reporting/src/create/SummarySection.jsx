import { useApp } from '../AppContext.js';
import { describeEvent, describeImmediateAction } from '../logic/eventSummary.js';

export function SummaryList({ rows }) {
  return (
    <dl className="summary-list">
      {rows.map((row) => (
        <div key={row.label} style={{ display: 'contents' }}>
          <dt>{row.label}</dt>
          <dd>{row.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

// Section 6: everything entered, with missing items flagged and a way back to each section (FR-014).
export default function SummarySection({ event, attachmentCount, missing, goToSection }) {
  const lists = useApp();
  const sections = describeEvent(event, lists, attachmentCount);

  return (
    <>
      {missing.length > 0 ? (
        <p className="message message--error" role="alert">
          Some required information is missing. Complete it before submitting, or save a draft.
        </p>
      ) : (
        <p className="message message--success">Everything required is filled in.</p>
      )}
      {sections.map((section) => {
        const sectionMissing = missing.filter((item) => item.section === section.section);
        return (
          <section key={section.section} className="card" aria-labelledby={`summary-${section.section}`}>
            <h2 id={`summary-${section.section}`}>{section.title}</h2>
            <SummaryList rows={section.rows} />
            {section.section === 'actions' &&
              event.immediateActions.map((action, index) => (
                <div key={action.id} className="card">
                  <h3>Immediate action {index + 1}</h3>
                  <SummaryList rows={describeImmediateAction(action, lists)} />
                </div>
              ))}
            {sectionMissing.length > 0 && (
              <ul className="missing-list">
                {sectionMissing.map((item) => (
                  <li key={item.field}>{item.message}</li>
                ))}
              </ul>
            )}
            <button type="button" className="button button--link" onClick={() => goToSection(section.section)}>
              Edit {section.title.toLowerCase()}
            </button>
          </section>
        );
      })}
    </>
  );
}
