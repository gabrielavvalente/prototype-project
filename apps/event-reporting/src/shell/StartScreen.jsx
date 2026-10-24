import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { resetDemoData } from '../data/db.js';
import { getLabel } from '../logic/lookups.js';

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
    <main className="page">
      <div className="start-brand">
        <span className="app-mark-logo" aria-hidden="true">
          ER
        </span>
        <h1>Event Reporting</h1>
      </div>
      <p className="field-hint">Prototype — choose a demo user to continue.</p>
      <ul className="card-list">
        {/* People who only use the Control Panel have no event role and are not offered here. */}
        {users.filter((user) => user.role).map((user) => (
          <li key={user.id}>
            <button type="button" className="button choice-card choice-card--row" onClick={() => handleSignIn(user.id)}>
              <span className="avatar" aria-hidden="true">
                {user.avatar}
              </span>
              <span className="list-row-text">
                <strong>{user.name}</strong>
                <small>
                  {user.role} · {user.access.map((entry) => getLabel(organization, entry.plantId)).join(', ')}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="button button--secondary" onClick={handleReset}>
        Reset demo data
      </button>
    </main>
  );
}
