import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const messages = {
  permission: "You don't have access to this page.",
  notFound: 'This page does not exist.',
};

// Shown when a page is outside the user's Control Panel roles (contracts/routes.md).
export default function NotAllowed({ reason = 'permission' }) {
  const title = reason === 'notFound' ? 'Not found' : 'Not allowed';

  useEffect(() => {
    document.title = `${title} — Control Panel`;
  }, [title]);

  return (
    <main className="page">
      <h1>{title}</h1>
      <p className="message message--warning">{messages[reason]}</p>
      <Link className="button button--secondary" to="/pillars">
        Back to pillars
      </Link>
    </main>
  );
}
