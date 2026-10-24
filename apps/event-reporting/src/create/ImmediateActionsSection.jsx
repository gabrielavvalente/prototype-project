import { useApp } from '../AppContext.js';
import { newId } from '../data/db.js';
import { getReferenceList, toDateString } from '../logic/lookups.js';
import { isImmediateActionRequired, MAX_PERFORMERS, validateImmediateAction } from '../logic/validation.js';
import { SeverityDots } from '../events/EventCard.jsx';
import { FieldError, SelectField, TextField } from './fields.jsx';

// Low, Medium, High shown with 1, 2 and 3 severity dots, like the levels.
const PRIORITY_DOTS_LEVEL = { Low: 'TF4', Medium: 'TF3', High: 'TF2' };

function emptyAction(today) {
  return {
    id: newId(),
    description: '',
    priority: '',
    categoryId: '',
    subcategoryId: '',
    planDetail: '',
    completionDate: today,
    kpiId: '',
    comments: '',
    performedByIds: [],
    // Immediate actions record containment already done at the scene (Clarification 2026-10-24).
    status: 'Completed',
    createdAt: new Date().toISOString(),
  };
}

function ActionCard({ action, index, reportDate, plantUsers, onChange, onRemove, showErrors }) {
  const { reference } = useApp();
  const subcategories = getReferenceList(reference, 'actionSubcategory');
  const today = toDateString(new Date());
  const errors = showErrors ? validateImmediateAction(action, reportDate, today, subcategories) : [];
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
    <li className="card">
      <h3>
        Immediate action {index + 1} <span className="tag tag--teal">COMPLETED</span>
      </h3>
      <div className="field">
        <label htmlFor={`${prefix}description`} className="required">
          Description
        </label>
        <textarea id={`${prefix}description`} value={action.description} onChange={(e) => set({ description: e.target.value })} />
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
      <SelectField
        id={`${prefix}categoryId`}
        label="Category"
        value={action.categoryId}
        options={getReferenceList(reference, 'actionCategory')}
        onChange={(value) => set({ categoryId: value, subcategoryId: '' })}
        errors={prefixed}
      />
      <SelectField
        id={`${prefix}subcategoryId`}
        label="Subcategory"
        value={action.subcategoryId}
        options={subcategories.filter((item) => item.categoryId === action.categoryId)}
        disabled={!action.categoryId}
        onChange={(value) => set({ subcategoryId: value })}
        errors={prefixed}
      />
      <div className="field">
        <label htmlFor={`${prefix}planDetail`}>Action plan detail (optional)</label>
        <textarea id={`${prefix}planDetail`} value={action.planDetail} onChange={(e) => set({ planDetail: e.target.value })} />
      </div>
      <TextField
        id={`${prefix}completionDate`}
        label="Completion date"
        type="date"
        value={action.completionDate}
        min={reportDate}
        max={today}
        onChange={(value) => set({ completionDate: value })}
        errors={prefixed}
      />
      <TextField id={`${prefix}kpiId`} label="KPI ID (optional)" value={action.kpiId} onChange={(value) => set({ kpiId: value })} />
      <div className="field">
        <label htmlFor={`${prefix}comments`}>Comments (optional)</label>
        <textarea id={`${prefix}comments`} value={action.comments} onChange={(e) => set({ comments: e.target.value })} />
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
      <button type="button" className="button button--link" onClick={onRemove}>
        Remove immediate action {index + 1}
      </button>
    </li>
  );
}

// Section 5: containment already done at the scene, saved as Completed (FR-011 to FR-013).
export default function ImmediateActionsSection({ event, update, errors, showErrors }) {
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
      <p className="field-hint">
        Record what was done straight away to make the situation safe.
        {isImmediateActionRequired(event.levelCode) ? ' At least one is required for TF1–TF3 and SRE1–SRE3.' : ''}
      </p>
      <FieldError errors={errors} field="immediateActions" />
      <ul className="card-list">
        {actions.map((action, index) => (
          <ActionCard
            key={action.id}
            action={action}
            index={index}
            reportDate={event.reportDate}
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
        onClick={() => update({ immediateActions: [...actions, emptyAction(toDateString(new Date()))] })}
      >
        Add immediate action
      </button>
    </>
  );
}
