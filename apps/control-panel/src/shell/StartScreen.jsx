import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { roleLevels, rolePeople, rolePillars } from '../../../../shared/platform/demoAccounts.js';
import { resetPlatformData } from '../../../../shared/platform/platformData.js';
import { LEVEL_LABELS } from '../../../../shared/platform/permissions.js';
import { describeRole, getPillars } from './roleText.js';
import Header from './Header.jsx';

// Demo "sign in": there is no real login in this prototype (spec Assumptions). The person is chosen
// in steps: pillar, level, then person; people without a Control Panel role are not offered
// (012 PD-7).
export default function StartScreen() {
  const { users, organization, reference, signIn } = useApp();
  const navigate = useNavigate();
  const pillars = getPillars(reference);
  const [pillarId, setPillarId] = useState(null);
  const [level, setLevel] = useState(null);
  const [userId, setUserId] = useState(null);
  const people = pillarId && level ? rolePeople(users, pillarId, level) : [];
  const chosen = people.find((user) => user.id === userId);

  useEffect(() => {
    document.title = 'Sign in — Control Panel';
  }, []);

  function handleSignIn(userId) {
    signIn(userId);
    navigate('/pillars');
  }

  async function handleReset() {
    const confirmed = window.confirm(
      'Reset demo data? Every workflow and master data change made on this device will be deleted.',
    );
    if (confirmed) {
      await resetPlatformData();
      window.location.reload();
    }
  }

  // Shows each role as "Health & Safety: Cluster · Lyon, Porto".
  function rolesText(user) {
    return user.controlPanelRoles
      .map((role) => `${pillars.find((pillar) => pillar.id === role.pillarId).label}: ${describeRole(role, organization)}`)
      .join(' — ');
  }

  return (
    <>
      <Header />
      <main className="page">
        <h1>Choose a demo account</h1>
        <p className="field-hint">Sign in to manage workflows and master data for your pillars.</p>
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
            description={chosen ? rolesText(chosen) : undefined}
          />
          <Button type="submit" disabled={!chosen}>
            Sign in
          </Button>
        </form>
        <button type="button" className="button button--secondary" onClick={handleReset}>
          Reset demo data
        </button>
      </main>
    </>
  );
}
