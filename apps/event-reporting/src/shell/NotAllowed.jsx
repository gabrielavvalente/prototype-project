import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Stack, Title } from '@mantine/core';

const messages = {
  permission: 'You do not have permission to open this page.',
  notFound: 'Event not found.',
};

// Shown when a route or an event is outside the user's role or scope (contracts/routes.md).
export default function NotAllowed({ reason = 'permission' }) {
  const title = reason === 'notFound' ? 'Not found' : 'Not allowed';

  useEffect(() => {
    document.title = `${title} — Event Reporting`;
  }, [title]);

  return (
    <main className="page">
      <Stack gap="md" className="not-allowed-page">
        <Title order={1}>{title}</Title>
        <Alert color="yellow" variant="light">{messages[reason]}</Alert>
        <Button component={Link} variant="default" to="/events">
          Back to Events
        </Button>
      </Stack>
    </main>
  );
}
