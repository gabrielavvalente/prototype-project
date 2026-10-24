import EventCard from './EventCard.jsx';
import { STATUSES, statusClass } from './StatusBadge.jsx';

// The Kanban view: one column per status, each with its event cards (FR-041).
export default function KanbanBoard({ events, onQuickView }) {
  return (
    <div className="kanban" role="list" aria-label="Events by status">
      {STATUSES.map((status) => {
        const columnEvents = events.filter((event) => event.status === status);
        return (
          <section key={status} className="kanban-column" role="listitem" aria-labelledby={`kanban-${statusClass(status)}`}>
            <h2 id={`kanban-${statusClass(status)}`} className="kanban-title">
              <span className={`kanban-dot ${statusClass(status)}`} aria-hidden="true" />
              {status}
              <span className={`kanban-count ${statusClass(status)}`}>{columnEvents.length}</span>
            </h2>
            {columnEvents.length === 0 ? (
              <p className="kanban-empty">No events</p>
            ) : (
              <ul className="kanban-cards">
                {columnEvents.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} onQuickView={onQuickView} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
