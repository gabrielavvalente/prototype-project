import { useEffect, useRef, useState } from 'react';
import Icon from '../shell/Icon.jsx';
import EventCard from './EventCard.jsx';
import { STATUSES, statusClass } from './StatusBadge.jsx';

// The Kanban view: one column per status, each with its event cards (FR-041). On narrow screens
// the board scrolls sideways and ‹ › buttons move one column at a time.
export default function KanbanBoard({ events, expandedId, onToggle }) {
  const boardRef = useRef(null);
  const [scroll, setScroll] = useState({ canLeft: false, canRight: false });

  // Show the buttons only when there is something to scroll to on that side.
  useEffect(() => {
    const board = boardRef.current;
    function measure() {
      setScroll({
        canLeft: board.scrollLeft > 4,
        canRight: board.scrollLeft + board.clientWidth < board.scrollWidth - 4,
      });
    }
    measure();
    board.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);
    return () => {
      board.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [events]);

  function scrollByColumn(direction) {
    const board = boardRef.current;
    const columnWidth = board.querySelector('.kanban-column').offsetWidth + 12;
    board.scrollBy({ left: direction * columnWidth, behavior: 'smooth' });
  }

  return (
    <div className="kanban-wrapper">
      {(scroll.canLeft || scroll.canRight) && (
        <div className="kanban-nav">
          <button type="button" className="icon-button" disabled={!scroll.canLeft} onClick={() => scrollByColumn(-1)}>
            <Icon name="back" label="Previous column" />
          </button>
          <button type="button" className="icon-button" disabled={!scroll.canRight} onClick={() => scrollByColumn(1)}>
            <Icon name="chevronRight" label="Next column" />
          </button>
        </div>
      )}
      <div className="kanban" ref={boardRef}>
        {STATUSES.filter((status) => status !== 'Archived' || events.some((event) => event.status === 'Archived')).map((status) => {
          const columnEvents = events.filter((event) => event.status === status);
          return (
            <section key={status} className="kanban-column" aria-labelledby={`kanban-${statusClass(status)}`}>
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
                      <EventCard event={event} expanded={expandedId === event.id} onToggle={() => onToggle(event.id)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
