import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { resetDemoData } from '../data/db.js';
import { getLabel } from '../logic/lookups.js';
import Header from './Header.jsx';

// Demo "sign in": there is no real login in this prototype (spec Assumptions).
export default function StartScreen() {
  const { users, organization, signIn } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign in — Event Reporting';
  }, []);

  async function handleSignIn(userId) {
    await signIn(userId);
    navigate('/entry');
  }

  async function handleReset() {
    const confirmed = window.confirm(
      'Reset demo data? Every event you reported on this device and every Control Panel change will be deleted.',
    );
    if (confirmed) {
      await resetDemoData();
      window.location.reload();
    }
  }

  return (
    <>
      <Header />
      <main className="page start-page">
        <Stack className="start-content" gap="xl">
          <Stack gap="xs">
            <Title order={1}>Choose a demo account</Title>
            <Text c="dimmed">Sign in to report and review events for your plants.</Text>
          </Stack>
          <div className="start-users">
            {/* People who only use the Control Panel have no event role and are not offered here. */}
            {users.filter((user) => user.role).map((user) => (
              <Card
                key={user.id}
                component="button"
                type="button"
                withBorder
                radius="md"
                padding="md"
                className="start-user-card"
                onClick={() => handleSignIn(user.id)}
              >
                <Group wrap="nowrap" align="center">
                  <Avatar radius="xl" color="blue" aria-hidden="true">{user.avatar}</Avatar>
                  <Stack gap={3} className="start-user-copy">
                    <Text fw={600}>{user.name}</Text>
                    <Text size="sm" c="dimmed">{user.role} · {user.access.map((entry) => getLabel(organization, entry.plantId)).join(', ')}</Text>
                  </Stack>
                  <Text className="start-user-arrow" c="dimmed" aria-hidden="true">›</Text>
                </Group>
              </Card>
            ))}
          </div>
          <Button variant="subtle" color="gray" className="reset-demo" onClick={handleReset}>
            Reset demo data
          </Button>
        </Stack>
      </main>
    </>
  );
}
