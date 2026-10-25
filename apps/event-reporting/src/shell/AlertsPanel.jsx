import { useNavigate } from 'react-router-dom';
import { Button, Text } from '@mantine/core';
import { formatRelativeTime } from '../logic/display.js';
import Icon from './Icon.jsx';
import Sheet from './Sheet.jsx';

// Notifications sheet: newest first, unread highlighted, "Mark all read" (FR-023, FR-043).
// items: [{ alert, event }] already filtered to the user's current scope.
export default function AlertsPanel({ items, onMarkRead, onClose }) {
  const navigate = useNavigate();
  const unread = items.filter((item) => !item.alert.readAt);

  async function open({ alert, event }) {
    await onMarkRead([alert]);
    onClose();
    navigate(`/events/${event.recordNumber || event.id}`);
  }

  return (
    <Sheet
      title="Notifications"
      titleExtra={unread.length > 0 && <span className="count-badge">{unread.length}</span>}
      headerAction={
        unread.length > 0 && (
          <Button type="button" variant="subtle" size="xs" onClick={() => onMarkRead(unread.map((item) => item.alert))}>
            Mark all read
          </Button>
        )
      }
      onClose={onClose}
    >
      {items.length === 0 ? (
        <Text c="dimmed">No notifications yet.</Text>
      ) : (
        <ul className="notification-list">
          {items.map((item) => (
            <li key={item.alert.id}>
              <button
                type="button"
                className={`notification${item.alert.readAt ? '' : ' notification--unread'}`}
                onClick={() => open(item)}
              >
                <span className="notification-icon">
                  <Icon name="file" />
                </span>
                <span className="notification-text">
                  <strong>
                    {item.alert.type}: {item.event.recordNumber}
                  </strong>
                  <span className="field-hint">{item.event.title}</span>
                </span>
                <span className="notification-time">
                  {formatRelativeTime(item.alert.createdAt)}
                  {!item.alert.readAt && (
                    <span className="unread-dot">
                      <span className="visually-hidden">Unread</span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
