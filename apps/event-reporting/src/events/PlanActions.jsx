import { useApp } from '../AppContext.js';
import { getLabel, getReferenceList } from '../logic/lookups.js';
import ActionLines, { formatDueDate } from './ActionLines.jsx';

// Every action of the event's plan (005 AP-1, AP-6): its immediate actions, always Completed and
// read-only here, then its corrective actions. The props of ActionLines apply to the corrective ones.
export default function PlanActions({ event, ...lineProps }) {
  const { users, reference } = useApp();
  const priorities = getReferenceList(reference, 'actionPriority');
  const immediate = event.immediateActions ?? [];
  return (
    <>
      <h4 className="rca-subheading">Immediate actions ({immediate.length})</h4>
      {immediate.length === 0 ? (
        <p className="field-hint">No immediate action recorded.</p>
      ) : (
        <ol className="immediate-compact-list">
          {immediate.map((action) => (
            <li key={action.id} className="immediate-compact-row action-compact-row">
              <span className="immediate-compact-text">{action.description}</span>
              <span className="immediate-compact-meta">
                <span className="action-status action-status--completed">Completed</span>
                {getLabel(priorities, action.priority)} · {action.performedByIds.map((id) => getLabel(users, id)).join(', ')}
                {action.completionDate && ` · Done ${formatDueDate(action.completionDate)}`}
              </span>
            </li>
          ))}
        </ol>
      )}
      <h4 className="rca-subheading">Corrective actions ({event.actions?.length ?? 0})</h4>
      <ActionLines actions={event.actions ?? []} {...lineProps} />
    </>
  );
}
