import { useApp } from '../AppContext.js';
import { Textarea } from '@mantine/core';
import { newId } from '../data/db.js';
import { getReferenceList } from '../logic/lookups.js';
import { MAX_PERFORMERS, validateImmediateAction } from '../logic/validation.js';
import { SeverityDots } from '../events/EventCard.jsx';
import Icon from '../shell/Icon.jsx';
import { FieldError } from './fields.jsx';

// Low, Medium, High, Urgent shown with 1 to 4 severity dots, like the levels.
const PRIORITY_DOTS_LEVEL = { Low: 'TF4', Medium: 'TF3', High: 'TF2', Urgent: 'TF1' };

// The completion date and the category (the event's pillar) are added when the event is saved.
function emptyAction() {
  return {
    id: newId(),
    description: '',
    priority: '',
    comments: '',
    performedByIds: [],
    // Immediate actions record containment already done at the scene (Clarification 2026-10-24).
    status: 'Completed',
    createdAt: new Date().toISOString(),
  };
}

function ActionCard({ action, index, plantUsers, onChange, onRemove, showErrors }) {
  const { reference } = useApp();
  const errors = showErrors ? validateImmediateAction(action) : [];
  // Field ids are unique per card so labels and errors match the right action.
  const prefix = `action-${index}-`;
  const prefixed = errors.map((item) => ({ ...item, field: prefix + item.field }));
  const set = (changes) => onChange({ ...action, ...changes });

  function togglePerformer(id) {
    const ids = action.performedByIds.includes(id)
      ? action.performedByIds.filter((item) => item !== id)
      : [...action.performedByIds, id];
    set({ performedByIds: ids });
  }

  return (
    <li className="card card--flat" id={`immediate-action-${index}`}>
      <div className="action-card-head">
        <h3>
          Immediate action {index + 1} <span className="tag tag--teal">COMPLETED</span>
        </h3>
        <button type="button" className="icon-button" onClick={onRemove}>
          <Icon name="close" size={18} label={`Remove immediate action ${index + 1}`} />
        </button>
      </div>
      <div className="field">
        <Textarea label="Description" required id={`${prefix}description`} minRows={3} autosize value={action.description} onChange={(e) => set({ description: e.target.value })} />
        <FieldError errors={prefixed} field={`${prefix}description`} />
      </div>
      <fieldset className="field" id={`${prefix}priority`}>
        <legend className="field-label required">Priority</legend>
        <div className="priority-options">
          {getReferenceList(reference, 'actionPriority').map((priority) => (
            <button
              key={priority.id}
              type="button"
              className="chip priority-chip"
              aria-pressed={action.priority === priority.id}
              onClick={() => set({ priority: priority.id })}
            >
              <SeverityDots levelCode={PRIORITY_DOTS_LEVEL[priority.label]} />
              {priority.label}
            </button>
          ))}
        </div>
        <FieldError errors={prefixed} field={`${prefix}priority`} />
      </fieldset>
      <div className="field">
        <Textarea label="Comments (optional)" id={`${prefix}comments`} minRows={2} autosize value={action.comments} onChange={(e) => set({ comments: e.target.value })} />
      </div>
      <fieldset className="field">
        <legend className="field-label required">Performed by</legend>
        <span className="field-hint">
          Choose 1 to {MAX_PERFORMERS} people ({action.performedByIds.length} of {MAX_PERFORMERS}).
        </span>
        <div className="chip-group">
          {plantUsers.map((person) => {
            const checked = action.performedByIds.includes(person.id);
            const limitReached = !checked && action.performedByIds.length >= MAX_PERFORMERS;
            return (
              <button
                key={person.id}
                type="button"
                className="chip"
                aria-pressed={checked}
                disabled={limitReached}
                onClick={() => togglePerformer(person.id)}
              >
                <span className="avatar avatar--small" aria-hidden="true">
                  {person.avatar}
                </span>
                {person.name}
              </button>
            );
          })}
        </div>
        <FieldError errors={prefixed} field={`${prefix}performedByIds`} />
      </fieldset>
    </li>
  );
}

// Immediate actions (optional): containment already done at the scene, saved as Completed (FR-011 to FR-013).
export default function ImmediateActionsSection({ event, update, showErrors }) {
  const { users } = useApp();
  const plantUsers = users.filter((person) => person.access.some((entry) => entry.plantId === event.plantId));
  const actions = event.immediateActions;

  function changeAction(index, action) {
    update({ immediateActions: actions.map((item, i) => (i === index ? action : item)) });
  }

  function removeAction(index) {
    update({ immediateActions: actions.filter((_, i) => i !== index) });
  }

  return (
    <>
      <p className="field-hint">Optional. Record what was done straight away to make the situation safe.</p>
      <ul className="card-list">
        {actions.map((action, index) => (
          <ActionCard
            key={action.id}
            action={action}
            index={index}
            plantUsers={plantUsers}
            onChange={(changed) => changeAction(index, changed)}
            onRemove={() => removeAction(index)}
            showErrors={showErrors}
          />
        ))}
      </ul>
      <button
        type="button"
        className="button button--secondary"
        onClick={() => update({ immediateActions: [...actions, emptyAction()] })}
      >
        Add immediate action
      </button>
    </>
  );
}
