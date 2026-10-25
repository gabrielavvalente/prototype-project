import Sheet from './Sheet.jsx';

// Control Panel notifications: settings someone else changed (FR-023), newest first.
export default function NotificationsPanel({ items, onClose }) {
  return (
    <Sheet title="Notifications" onClose={onClose}>
      {items.length === 0 && <p className="field-hint">No notifications.</p>}
      <ul className="notification-list">
        {items.map((item) => (
          <li key={item.id} className={`notification ${item.read ? '' : 'notification--unread'}`}>
            <p>{item.text}</p>
            <small>{new Date(item.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</small>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
