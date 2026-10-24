import Icon from '../shell/Icon.jsx';

// All form sections in view: done, current and upcoming (FR-038).
// Steps already reached can be opened again; later ones cannot be skipped to.
export default function Stepper({ steps, current, furthest, onSelect }) {
  return (
    <nav className="stepper" aria-label="Form sections">
      <ol>
        {steps.map((step, index) => {
          const state = index === current ? 'current' : index < current || index <= furthest ? 'done' : 'upcoming';
          const reachable = index <= furthest && index !== current;
          return (
            <li key={step.key} className={`stepper-step stepper-step--${state}`}>
              <button
                type="button"
                disabled={!reachable}
                aria-current={index === current ? 'step' : undefined}
                onClick={() => onSelect(index)}
              >
                <span className="stepper-number" aria-hidden="true">
                  {state === 'done' ? <Icon name="check" size={14} /> : index + 1}
                </span>
                <span className="stepper-title">{step.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="visually-hidden" aria-live="polite">
        Section {current + 1} of {steps.length}: {steps[current].title}
      </p>
    </nav>
  );
}
