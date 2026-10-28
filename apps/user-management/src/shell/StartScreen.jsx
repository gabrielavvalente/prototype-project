import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Group, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { roleLevels, rolePeople, rolePillars } from '../../../../shared/platform/demoAccounts.js';
import { LEVEL_LABELS } from '../../../../shared/platform/permissions.js';
import { roleBadge } from './text.js';
import Header from './Header.jsx';

// The person is chosen in steps: pillar, level, then person (012 PD-7).
export default function StartScreen() {
  const { users, reference, signIn } = useApp();
  const navigate = useNavigate();
  const pillars = reference.filter((item) => item.list === 'pillar');
  const [pillarId, setPillarId] = useState(null);
  const [level, setLevel] = useState(null);
  const [userId, setUserId] = useState(null);
  const people = pillarId && level ? rolePeople(users, pillarId, level) : [];
  const chosen = people.find((user) => user.id === userId);

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
          <form
            className="start-steps"
            onSubmit={(e) => {
              e.preventDefault();
              if (chosen) handleSignIn(chosen.id);
            }}
          >
            <Select
              id="start-pillar"
              label="Pillar"
              placeholder="Choose a pillar"
              data={rolePillars(users, pillars).map((pillar) => ({ value: pillar.id, label: pillar.label }))}
              value={pillarId}
              onChange={(value) => {
                setPillarId(value);
                setLevel(null);
                setUserId(null);
              }}
            />
            <Select
              id="start-level"
              label="Level"
              placeholder={pillarId ? 'Choose a level' : 'Choose a pillar first'}
              disabled={!pillarId}
              data={pillarId ? roleLevels(users, pillarId).map((item) => ({ value: item, label: LEVEL_LABELS[item] })) : []}
              value={level}
              onChange={(value) => {
                setLevel(value);
                setUserId(null);
              }}
            />
            <Select
              id="start-person"
              label="Person"
              placeholder={level ? 'Choose a person' : 'Choose a level first'}
              disabled={!level}
              data={people.map((user) => ({ value: user.id, label: user.name }))}
              value={userId}
              onChange={setUserId}
              description={chosen ? chosen.controlPanelRoles.map((role) => roleBadge(role, reference)).join(', ') : undefined}
            />
            <Button type="submit" disabled={!chosen}>
              Sign in
            </Button>
          </form>
        </Paper>
        <Text size="sm" c="dimmed" ta="center">
          Prototype · All user information is read-only
        </Text>
        </Stack>
      </main>
    </>
  );
}
