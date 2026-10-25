import { useState } from 'react';
import { NativeSelect, Textarea } from '@mantine/core';
import { fiveW1HSections } from '../logic/rootCause.js';
import RcaNav from './RcaNav.jsx';

const APPLIES = [
  { value: '', label: 'Choose' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
const appliesValue = (applies) => (applies === true ? 'yes' : applies === false ? 'no' : '');

// What the list shows next to a section once it is decided.
function sectionNote(section, value) {
  if (value.applies === false) return 'N/A';
  if (value.applies !== true) return '';
  const answered = section.questions.filter((question) => (value.answers[question.id] || '').trim()).length;
  return `${answered}/${section.questions.length}`;
}

// 5W1H, an optional guide (ui-ux/5w1h.png, 004 FR-008): pick a section, say whether it applies,
// then answer its numbered questions.
export default function FiveW1HPart({ pillarId, value, onChange, readOnly }) {
  const sections = fiveW1HSections(pillarId);
  const [currentKey, setCurrentKey] = useState(sections[0].key);
  const section = sections.find((item) => item.key === currentKey);
  const current = value[currentKey];
  const set = (changes) => onChange({ ...value, [currentKey]: { ...current, ...changes } });
  const setAnswer = (questionId, text) => set({ answers: { ...current.answers, [questionId]: text } });

  return (
    <div className="rca-split">
      <RcaNav
        title="Checklists"
        items={sections.map((item) => ({ key: item.key, label: item.label, note: sectionNote(item, value[item.key]) }))}
        current={currentKey}
        onSelect={setCurrentKey}
      />
      <fieldset className="rca-panel section-fieldset" disabled={readOnly}>
        <div className="rca-panel-head">
          <h4>{section.label}</h4>
          <NativeSelect
            label="Is this section applicable to your event?"
            data={APPLIES}
            value={appliesValue(current.applies)}
            onChange={(e) => set({ applies: e.target.value === '' ? null : e.target.value === 'yes' })}
          />
        </div>
        {current.applies && (
          <ol className="rca-questions">
            {section.questions.map((question) => (
              <li key={question.id}>
                <Textarea
                  label={question.text}
                  description={question.hint}
                  minRows={1}
                  autosize
                  value={current.answers[question.id] || ''}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                />
              </li>
            ))}
          </ol>
        )}
        {current.applies === false && <p className="field-hint">Not applicable to this event.</p>}
      </fieldset>
    </div>
  );
}
