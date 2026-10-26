import { useApp } from '../AppContext.js';
import { getLabel } from '../logic/lookups.js';
import { formatDueDate } from './ActionLines.jsx';

// "Due date changed from <old> to <new> by <name> on <date>", newest first (005 AP-8).
export default function DueDateHistory({ history }) {
  const { users } = useApp();
  if (!history?.length) return null;
  return (
    <ul className="due-date-history">
      {history.map((entry) => (
        <li key={entry.at}>
          Due date changed from {formatDueDate(entry.from)} to {formatDueDate(entry.to)} by {getLabel(users, entry.by)} on{' '}
          {new Date(entry.at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
        </li>
      ))}
    </ul>
  );
}
