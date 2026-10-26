import { useState } from 'react';
import { Button } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { ACTION_STATUS_LABELS, isOverdue } from '../logic/actions.js';
import { getLabel } from '../logic/lookups.js';
import Icon from '../shell/Icon.jsx';
import DueDateHistory from './DueDateHistory.jsx';

export function formatDueDate(dateText) {
  return new Date(`${dateText}T00:00:00`).toLocaleDateString('en-GB', { dateStyle: 'medium' });
}

const STATUS_BUTTONS = { toComplete: 'To Complete', completed: 'Completed', cancelled: 'Cancel' };

// The actions of the plan in compact lines, shared by the analysis and the Actions step (005 AP-6):
// the why's answer on its own line, then the action; owners edit and delete Planned actions; the
// statuses each person may give are buttons (statusesFor). today: 'YYYY-MM-DD'.
export default function ActionLines({ actions, whyText, today, canEdit, statusesFor, onEdit, onDelete, onStatus }) {
  const { users } = useApp();
  const [notice, setNotice] = useState(null);
  if (actions.length === 0) {
    return <p className="field-hint">No action yet.</p>;
  }
  return (
    <ol className="immediate-compact-list">
      {actions.map((action, index) => {
        const overdue = isOverdue(action, today);
        const why = action.whyId ? whyText(action.whyId) : '';
        const statuses = statusesFor ? statusesFor(action) : [];
        return (
          <li key={action.id} className="immediate-compact-row action-compact-row">
            {why && <span className="action-compact-why">Why: {why}</span>}
            <span className="immediate-compact-text">{action.description}</span>
            <span className="immediate-compact-meta">
              <span className={`action-status action-status--${action.status}`}>{ACTION_STATUS_LABELS[action.status]}</span>
              {overdue && <span className="action-status action-status--overdue">Overdue</span>}
              {action.notifyMaintenance && <span className="tag">Maintenance</span>}
              {' '}
              {action.priority} · {action.assigneeIds.map((id) => getLabel(users, id)).join(', ')} · Due {formatDueDate(action.dueDate)}
            </span>
            {canEdit && (
              <span className="immediate-compact-buttons">
                <button type="button" className="icon-button" onClick={() => onEdit(action)}>
                  <Icon name="edit" size={16} label={`Edit action ${index + 1}`} />
                </button>
                {action.status === 'planned' && (
                  <button type="button" className="icon-button" onClick={() => onDelete(action)}>
                    <Icon name="close" size={16} label={`Delete action ${index + 1}`} />
                  </button>
                )}
              </span>
            )}
            <div className="action-line-footer">
              {statuses.map((status) => (
                <Button
                  key={status}
                  type="button"
                  size="compact-xs"
                  variant={status === 'cancelled' ? 'subtle' : 'default'}
                  color={status === 'cancelled' ? 'red' : undefined}
                  onClick={() => onStatus(action, status)}
                >
                  {STATUS_BUTTONS[status]}
                </Button>
              ))}
              <Button type="button" size="compact-xs" variant="subtle" onClick={() => setNotice(notice === action.id ? null : action.id)}>
                View in Action Management
              </Button>
            </div>
            {notice === action.id && (
              <p className="field-hint action-line-notice" role="status">
                Action Management is not connected in this prototype.
              </p>
            )}
            <div className="action-line-history">
              <DueDateHistory history={action.dueDateHistory} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
