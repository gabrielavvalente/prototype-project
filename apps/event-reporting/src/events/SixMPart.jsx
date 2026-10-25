import { Button, NativeSelect, Textarea, TextInput } from '@mantine/core';
import { MAX_CAUSES, THEMES } from '../logic/rootCause.js';
import Icon from '../shell/Icon.jsx';

// 6M: contributory causes sorted into the six themes, each with why it was a possible cause, at
// most 6 in total (004 FR-009).
export default function SixMPart({ causes, onChange, readOnly }) {
  const update = (id, changes) => onChange(causes.map((cause) => (cause.id === id ? { ...cause, ...changes } : cause)));
  const add = () => onChange([...causes, { id: crypto.randomUUID(), theme: THEMES[0], cause: '', why: '' }]);
  const full = causes.length >= MAX_CAUSES;

  return (
    <>
      {causes.length === 0 && <p className="field-hint">No cause yet.</p>}
      <ol className="rca-grid rca-list">
        {causes.map((cause, index) => (
          <li key={cause.id} className="rca-card">
            <div className="rca-card-head">
              <strong>Cause {index + 1}</strong>
              {!readOnly && (
                <button type="button" className="icon-button" onClick={() => onChange(causes.filter((item) => item.id !== cause.id))}>
                  <Icon name="close" size={16} label={`Remove cause ${index + 1}`} />
                </button>
              )}
            </div>
            <NativeSelect label="Theme" data={THEMES} value={cause.theme} onChange={(e) => update(cause.id, { theme: e.target.value })} />
            <TextInput label="Cause" value={cause.cause} onChange={(e) => update(cause.id, { cause: e.target.value })} />
            <Textarea
              label={`Why was ${cause.cause.trim() ? `"${cause.cause.trim()}"` : 'this'} a possible cause?`}
              minRows={2}
              autosize
              value={cause.why}
              onChange={(e) => update(cause.id, { why: e.target.value })}
            />
          </li>
        ))}
      </ol>
      {!readOnly && (
        <div className="rca-part-actions">
          <Button type="button" variant="default" leftSection={<Icon name="plus" size={16} />} disabled={full} onClick={add}>
            Add cause
          </Button>
          {full && <span className="field-hint">At most {MAX_CAUSES} causes.</span>}
        </div>
      )}
    </>
  );
}
