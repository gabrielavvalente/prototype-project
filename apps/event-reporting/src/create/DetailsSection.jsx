import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { getReferenceList } from '../logic/lookups.js';
import { FieldError, SelectField, YesNoField } from './fields.jsx';

// Section 4: who was involved, recurrence, comments, feedback emails, diseases for OH (FR-010).
export default function DetailsSection({ event, update, errors }) {
  const { reference } = useApp();
  const [newEmail, setNewEmail] = useState('');
  const diseases = getReferenceList(reference, 'disease');

  function addEmail() {
    const email = newEmail.trim();
    if (email && !event.feedbackEmails.includes(email)) {
      update({ feedbackEmails: [...event.feedbackEmails, email] });
    }
    setNewEmail('');
  }

  function toggleDisease(id) {
    const diseaseIds = event.diseaseIds.includes(id)
      ? event.diseaseIds.filter((item) => item !== id)
      : [...event.diseaseIds, id];
    update({ diseaseIds });
  }

  return (
    <>
      <SelectField
        id="employeeType"
        label="Employee type"
        value={event.employeeType}
        options={getReferenceList(reference, 'employeeType')}
        onChange={(value) => update({ employeeType: value })}
        errors={errors}
      />
      <YesNoField
        id="recurrence"
        label="Has this happened before?"
        value={event.recurrence}
        onChange={(value) => update({ recurrence: value })}
        errors={errors}
      />
      <div className="field">
        <label htmlFor="comments">Comments (optional)</label>
        <textarea id="comments" value={event.comments} onChange={(e) => update({ comments: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="feedbackEmail">Feedback email recipients (optional)</label>
        <span className="field-hint">These people will be told about this event. Emails are not sent in this prototype.</span>
        <div className="yes-no">
          <input
            id="feedbackEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addEmail();
              }
            }}
          />
          <button type="button" className="button" onClick={addEmail}>
            Add
          </button>
        </div>
        {event.feedbackEmails.length > 0 && (
          <ul>
            {event.feedbackEmails.map((email) => (
              <li key={email}>
                {email}{' '}
                <button
                  type="button"
                  className="button button--link"
                  onClick={() => update({ feedbackEmails: event.feedbackEmails.filter((item) => item !== email) })}
                >
                  Remove<span className="visually-hidden"> {email}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <FieldError errors={errors} field="feedbackEmails" />
      </div>
      {event.familyCode === 'OH' && (
        <fieldset className="field">
          <legend className="field-label">Disease(s)</legend>
          {diseases.map((disease) => (
            <label key={disease.id} className="field-hint">
              <input
                type="checkbox"
                checked={event.diseaseIds.includes(disease.id)}
                onChange={() => toggleDisease(disease.id)}
              />{' '}
              {disease.label}
            </label>
          ))}
          <FieldError errors={errors} field="diseaseIds" />
        </fieldset>
      )}
    </>
  );
}
