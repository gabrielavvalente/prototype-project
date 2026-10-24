import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const messages = {
  permission: "You don't have access to this page.",
  notFound: 'This user does not exist.',
};

// Shown when a page or a user is outside the signed-in person's perimeter (FR-027).
export default function NotAllowed({ reason = 'permission' }) {
  const title = reason === 'notFound' ? 'Not found' : 'Not allowed';

  useEffect(() => {
    document.title = `${title} — User Management`;
  }, [title]);

  return (
    <main className="page">
      <h1>{title}</h1>
      <p className="message message--warning">{messages[reason]}</p>
      <Link className="button button--secondary" to="/users">
        Back to users
      </Link>
    </main>
  );
}
