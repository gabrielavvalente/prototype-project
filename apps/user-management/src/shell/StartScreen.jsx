import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { hasControlPanelAccess } from '../../../../shared/platform/permissions.js';
import { roleBadge } from './text.js';

// Demo "sign in": there is no real login in this prototype. Only people holding a Control Panel
// role may see users (spec FR-027).
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
    <main className="page">
      <div className="start-brand">
        <span className="app-mark-logo" aria-hidden="true">
          UM
        </span>
        <h1>User Management</h1>
      </div>
      <p className="field-hint">Prototype — choose a demo user to continue. Users are shown read-only.</p>
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
                  <small>
                    {allowed
                      ? user.controlPanelRoles.map((role) => roleBadge(role, reference)).join(', ')
                      : 'No Control Panel role'}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
