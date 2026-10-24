import { Link } from 'react-router-dom';

const messages = {
  permission: 'You do not have permission to open this page.',
  notFound: 'Event not found.',
};

// Shown when a route or an event is outside the user's role or scope (contracts/routes.md).
export default function NotAllowed({ reason = 'permission' }) {
  return (
    <main className="page">
      <h1>{reason === 'notFound' ? 'Not found' : 'Not allowed'}</h1>
      <p className="message message--warning">{messages[reason]}</p>
      <Link className="button button--secondary" to="/events">
        Back to Events
      </Link>
    </main>
  );
}
