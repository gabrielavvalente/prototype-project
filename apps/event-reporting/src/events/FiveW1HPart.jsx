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

// How many of a section's questions are answered, shown next to it in the list.
function sectionNote(section, value) {
  const answered = section.questions.filter((question) => (value.answers[question.id] || '').trim()).length;
  return `${answered}/${section.questions.length}`;
}

// 5W1H, an optional guide (ui-ux/5w1h.png, 004 FR-008): one "applicable?" question for the whole
// guide (014 RCA-10); when it applies, pick a section and answer its numbered questions.
export default function FiveW1HPart({ pillarId, applies, onAppliesChange, value, onChange, readOnly }) {
  const sections = fiveW1HSections(pillarId);
  const [currentKey, setCurrentKey] = useState(sections[0].key);
  const section = sections.find((item) => item.key === currentKey);
  const current = value[currentKey];
  const setAnswer = (questionId, text) => onChange({ ...value, [currentKey]: { ...current, answers: { ...current.answers, [questionId]: text } } });

  return (
    <fieldset className="section-fieldset" disabled={readOnly}>
      <NativeSelect
        label="Is this section applicable to your event?"
        data={APPLIES}
        value={appliesValue(applies)}
        onChange={(e) => onAppliesChange(e.target.value === '' ? null : e.target.value === 'yes')}
      />
      {applies === false && <p className="field-hint">Not applicable to this event.</p>}
      {applies === true && (
        <div className="rca-split">
          <RcaNav
            title="Checklists"
            items={sections.map((item) => ({ key: item.key, label: item.label, note: sectionNote(item, value[item.key]) }))}
            current={currentKey}
            onSelect={setCurrentKey}
          />
          <div className="rca-panel">
            <div className="rca-panel-head">
              <h4>{section.label}</h4>
            </div>
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
          </div>
        </div>
      )}
    </fieldset>
  );
}
