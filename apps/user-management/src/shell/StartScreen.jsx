import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { hasControlPanelAccess } from '../../../../shared/platform/permissions.js';
import { roleBadge } from './text.js';
import Header from './Header.jsx';

export default function StartScreen() {
  const { users, reference, signIn } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign in — User Management';
  }, []);

  function handleSignIn(userId) {
    signIn(userId);
    navigate('/users');
  }

  return (
    <>
      <Header />
      <main className="page start-page">
        <Stack gap="xl">
          <div className="start-intro">
            <Text className="eyebrow">PLATFORM DIRECTORY</Text>
            <Title order={1}>Choose a demo account</Title>
            <Text c="dimmed" size="lg">
              Inspect the people and access in your Control Panel perimeter.
            </Text>
          </div>

        <Paper className="demo-panel" p="xl" radius="md" withBorder>
          <Group justify="space-between" mb="lg" align="start">
            <div>
              <Text fw={600} size="lg">
                Select an account
              </Text>
              <Text size="sm" c="dimmed">
                Only users with a Control Panel role can continue.
              </Text>
            </div>
            <Badge variant="light" color="blue" size="lg" radius="sm">
              {users.length} demo accounts
            </Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
            {users.map((user) => {
              const allowed = hasControlPanelAccess(user);
              const roles = user.controlPanelRoles.map((role) => roleBadge(role, reference)).join(', ');
              return (
                <Button
                  key={user.id}
                  type="button"
                  variant="default"
                  disabled={!allowed}
                  onClick={() => handleSignIn(user.id)}
                  className="demo-user-button"
                >
                  <Group wrap="nowrap" w="100%" gap="sm">
                    <Avatar color={allowed ? 'blue' : 'gray'} radius="xl" size={42}>
                      {user.avatar}
                    </Avatar>
                    <Stack gap={2} align="flex-start" className="demo-user-copy">
                      <Text fw={600} size="sm" c={allowed ? 'dark' : 'dimmed'} lineClamp={1}>
                        {user.name}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {allowed ? roles : 'No Control Panel role'}
                      </Text>
                    </Stack>
                  </Group>
                </Button>
              );
            })}
          </SimpleGrid>
        </Paper>
        <Text size="sm" c="dimmed" ta="center">
          Prototype · All user information is read-only
        </Text>
        </Stack>
      </main>
    </>
  );
}
