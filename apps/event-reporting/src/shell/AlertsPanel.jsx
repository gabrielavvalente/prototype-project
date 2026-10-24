import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function formatDate(isoText) {
  return new Date(isoText).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// Sliding panel with the user's alerts, newest first (FR-023).
// items: [{ alert, event }] already filtered to the user's current scope.
export default function AlertsPanel({ items, onClose }) {
  const navigate = useNavigate();
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current.focus();
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  function open(event) {
    onClose();
    navigate(`/events/${event.recordNumber || event.id}`);
  }

  return (
    <div className="side-panel-backdrop" onClick={onClose}>
      <aside
        className="side-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alerts-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="side-panel-header">
          <h2 id="alerts-title" tabIndex={-1} ref={headingRef}>
            My Alerts
          </h2>
          <button type="button" className="button" onClick={onClose}>
            Close
          </button>
        </div>
        {items.length === 0 ? (
          <p>No alerts yet.</p>
        ) : (
          <ul className="card-list">
            {items.map(({ alert, event }) => (
              <li key={alert.id}>
                <button type="button" className="button choice-card" onClick={() => open(event)}>
                  <strong>
                    {event.recordNumber} — {event.title}
                  </strong>
                  <small>
                    {alert.type} · {formatDate(alert.createdAt)}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
