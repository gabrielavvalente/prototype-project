import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { resetPlatformData } from '../../../../shared/platform/platformData.js';
import { hasControlPanelAccess } from '../../../../shared/platform/permissions.js';
import { describeRole, getPillars } from './roleText.js';
import Header from './Header.jsx';

// Demo "sign in": there is no real login in this prototype (spec Assumptions).
export default function StartScreen() {
  const { users, organization, reference, signIn } = useApp();
  const navigate = useNavigate();
  const pillars = getPillars(reference);

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
        <ul className="card-list">
          {users.map((user) => {
            const allowed = hasControlPanelAccess(user);
            return (
              <li key={user.id}>
                <button
                  type="button"
                  className="button choice-card choice-card--row"
                  disabled={!allowed}
                  onClick={() => handleSignIn(user.id)}
                >
                  <span className="avatar" aria-hidden="true">
                    {user.avatar}
                  </span>
                  <span className="list-row-text">
                    <strong>{user.name}</strong>
                    <small>{allowed ? rolesText(user) : 'No Control Panel role'}</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="button button--secondary" onClick={handleReset}>
          Reset demo data
        </button>
      </main>
    </>
  );
}
