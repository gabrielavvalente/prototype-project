import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Stack, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { accountPeople, accountPlants, accountRoles } from '../../../../shared/platform/demoAccounts.js';
import { resetDemoData } from '../data/db.js';
import { getLabel } from '../logic/lookups.js';
import Header from './Header.jsx';

// Demo "sign in": there is no real login in this prototype (spec Assumptions). The person is chosen
// in steps: plant, event role, then person (012 PD-7).
export default function StartScreen() {
  const { users, organization, signIn } = useApp();
  const navigate = useNavigate();
  const [plantId, setPlantId] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const people = plantId && role ? accountPeople(users, plantId, role) : [];
  const chosen = people.find((user) => user.id === userId);

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
          {/* People who only use the Control Panel have no event role and are not offered here. */}
          <form
            className="start-steps"
            onSubmit={(e) => {
              e.preventDefault();
              if (chosen) handleSignIn(chosen.id);
            }}
          >
            <Select
              id="start-plant"
              label="Plant"
              placeholder="Choose a plant"
              data={accountPlants(users, organization).map((plant) => ({ value: plant.id, label: plant.name }))}
              value={plantId}
              onChange={(value) => {
                setPlantId(value);
                setRole(null);
                setUserId(null);
              }}
            />
            <Select
              id="start-role"
              label="Role"
              placeholder={plantId ? 'Choose a role' : 'Choose a plant first'}
              disabled={!plantId}
              data={plantId ? accountRoles(users, plantId) : []}
              value={role}
              onChange={(value) => {
                setRole(value);
                setUserId(null);
              }}
            />
            <Select
              id="start-person"
              label="Person"
              placeholder={role ? 'Choose a person' : 'Choose a role first'}
              disabled={!role}
              data={people.map((user) => ({ value: user.id, label: user.name }))}
              value={userId}
              onChange={setUserId}
              description={chosen ? `${chosen.role} · ${chosen.access.map((entry) => getLabel(organization, entry.plantId)).join(', ')}` : undefined}
            />
            <Button type="submit" disabled={!chosen}>
              Sign in
            </Button>
          </form>
          <Button variant="subtle" color="gray" className="reset-demo" onClick={handleReset}>
            Reset demo data
          </Button>
        </Stack>
      </main>
    </>
  );
}
