import { useApp } from '../AppContext.js';
import { getLabel } from '../logic/lookups.js';
import Icon from '../shell/Icon.jsx';

function formatDate(dateText) {
  return new Date(`${dateText}T00:00:00`).toLocaleDateString('en-GB', { dateStyle: 'medium' });
}

// The actions created from the whys, listed under 5 Why like the immediate actions: one line for
// the why, one for the action (004 FR-011a).
export default function ActionsSummary({ actions, whyText, readOnly, onEdit, onDelete }) {
  const { users } = useApp();
  if (actions.length === 0) {
    return <p className="field-hint">No action yet. Use "Add action" on an answered why.</p>;
  }
  return (
    <ol className="immediate-compact-list">
      {actions.map((action, index) => (
        <li key={action.id} className="immediate-compact-row action-compact-row">
          <span className="action-compact-why">Why: {whyText(action.whyId)}</span>
          <span className="immediate-compact-text">{action.description}</span>
          <span className="immediate-compact-meta">
            {action.priority} · {action.assigneeIds.map((id) => getLabel(users, id)).join(', ')} · Due {formatDate(action.dueDate)}
          </span>
          {!readOnly && (
            <span className="immediate-compact-buttons">
              <button type="button" className="icon-button" onClick={() => onEdit(action)}>
                <Icon name="edit" size={16} label={`Edit action ${index + 1}`} />
              </button>
              <button type="button" className="icon-button" onClick={() => onDelete(action)}>
                <Icon name="close" size={16} label={`Delete action ${index + 1}`} />
              </button>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
