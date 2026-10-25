import { useState } from 'react';
import { Button, Modal } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { ActionCard, emptyAction } from '../create/ImmediateActionsSection.jsx';
import { getLabel, getReferenceList } from '../logic/lookups.js';
import { validateImmediateAction } from '../logic/validation.js';
import Icon from '../shell/Icon.jsx';

// Adds or edits one immediate action with the submission's card; kept only when complete.
function ImmediateActionModal({ action, index, plantUsers, onSave, onClose }) {
  const isNew = !action.description;
  const [draft, setDraft] = useState(action);
  const [showErrors, setShowErrors] = useState(false);

  function save() {
    if (validateImmediateAction(draft).length > 0) {
      setShowErrors(true);
      return;
    }
    onSave(draft);
  }

  return (
    <Modal opened onClose={onClose} title={isNew ? 'New immediate action' : 'Edit immediate action'} size="lg">
      <ul className="card-list">
        <ActionCard action={draft} index={index} plantUsers={plantUsers} onChange={setDraft} showErrors={showErrors} removable={false} />
      </ul>
      <div className="form-actions">
        <Button type="button" variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={save}>
          {isNew ? 'Create' : 'Save'}
        </Button>
      </div>
    </Modal>
  );
}

// The submission's immediate actions in the root cause analysis, one compact line each; adding and
// editing happen in a popup (004 FR-007a).
export default function ImmediateActionsList({ event, actions, onChange, readOnly }) {
  const { users, reference } = useApp();
  const [editing, setEditing] = useState(null);
  const priorities = getReferenceList(reference, 'actionPriority');
  const plantUsers = users.filter((person) => person.access.some((entry) => entry.plantId === event.plantId));

  function keep(action) {
    onChange(actions.some((item) => item.id === action.id) ? actions.map((item) => (item.id === action.id ? action : item)) : [...actions, action]);
    setEditing(null);
  }

  function remove(action, index) {
    if (window.confirm(`Delete immediate action ${index + 1}? It is removed from the submission too.`)) {
      onChange(actions.filter((item) => item.id !== action.id));
    }
  }

  return (
    <div className="immediate-compact">
      {actions.length === 0 && <p className="field-hint">No immediate action recorded.</p>}
      <ol className="immediate-compact-list">
        {actions.map((action, index) => (
          <li key={action.id} className="immediate-compact-row">
            <span className="immediate-compact-text">{action.description}</span>
            <span className="immediate-compact-meta">
              {getLabel(priorities, action.priority)} · {action.performedByIds.map((id) => getLabel(users, id)).join(', ')}
            </span>
            {!readOnly && (
              <span className="immediate-compact-buttons">
                <button type="button" className="icon-button" onClick={() => setEditing({ action, index })}>
                  <Icon name="edit" size={16} label={`Edit immediate action ${index + 1}`} />
                </button>
                <button type="button" className="icon-button" onClick={() => remove(action, index)}>
                  <Icon name="close" size={16} label={`Delete immediate action ${index + 1}`} />
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!readOnly && (
        <Button
          type="button"
          variant="default"
          size="compact-sm"
          leftSection={<Icon name="plus" size={14} />}
          onClick={() => setEditing({ action: emptyAction(), index: actions.length })}
        >
          Add immediate action
        </Button>
      )}
      {editing && (
        <ImmediateActionModal
          action={editing.action}
          index={editing.index}
          plantUsers={plantUsers}
          onSave={keep}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
