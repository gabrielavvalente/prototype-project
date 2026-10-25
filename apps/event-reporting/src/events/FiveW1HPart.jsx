import { Textarea } from '@mantine/core';
import { YesNoField } from '../create/fields.jsx';
import { FIVE_W1H } from '../logic/rootCause.js';

// 5W1H: an optional guide — for each section, does it apply, and if so the answer (004 FR-008).
export default function FiveW1HPart({ value, onChange }) {
  const set = (key, changes) => onChange({ ...value, [key]: { ...value[key], ...changes } });
  return (
    <div className="rca-grid">
      {FIVE_W1H.map((section) => (
        <div key={section.key} className="rca-card">
          <YesNoField
            id={`fiveW1H-${section.key}`}
            label={`${section.label} — does it apply?`}
            hint={section.question}
            required={false}
            value={value[section.key].applies}
            onChange={(applies) => set(section.key, { applies })}
          />
          {value[section.key].applies && (
            <Textarea
              aria-label={`${section.label}: answer`}
              minRows={2}
              autosize
              value={value[section.key].answer}
              onChange={(e) => set(section.key, { answer: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  );
}
