import { useEffect } from 'react';
import { Alert, Button, Paper, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

const messages = {
  permission: "You don't have access to this page.",
  notFound: 'This user does not exist.',
};

export default function NotAllowed({ reason = 'permission' }) {
  const title = reason === 'notFound' ? 'Not found' : 'Not allowed';

  useEffect(() => {
    document.title = `${title} — User Management`;
  }, [title]);

  return (
    <main className="page">
      <Paper className="message-panel" p="xl" radius="md" withBorder>
        <Stack gap="md">
          <div>
            <Text className="eyebrow">USER MANAGEMENT</Text>
            <Title order={1}>{title}</Title>
          </div>
          <Alert color={reason === 'notFound' ? 'blue' : 'yellow'} variant="light">
            {messages[reason]}
          </Alert>
          <Button component={Link} to="/users" w="fit-content">
            Back to users
          </Button>
        </Stack>
      </Paper>
    </main>
  );
}
