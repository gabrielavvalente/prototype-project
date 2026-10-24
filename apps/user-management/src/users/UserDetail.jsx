import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { canSeeUser, LEVEL_LABELS } from '../../../../shared/platform/permissions.js';
import { PHASE_LABELS } from '../../../../shared/platform/workflow.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import { describePlants, pillarLabel } from '../shell/text.js';

// All of one user's access in one place, read-only (FR-028): event access per plant, Control
// Panel roles, and the review groups (workflow settings listing them as reviewer).
export default function UserDetail() {
  const { userId } = useParams();
  const { user: viewer, users, organization, reference, workflowSettings } = useApp();
  const person = users.find((item) => item.id === userId);
  const allowed = person && canSeeUser(viewer, person);

  useEffect(() => {
    if (allowed) {
      document.title = `${person.name} — User Management`;
    }
  }, [allowed, person]);

  if (!person) {
    return <NotAllowed reason="notFound" />;
  }
  if (!allowed) {
    return <NotAllowed />;
  }

  const reviewGroups = workflowSettings.filter((setting) => setting.reviewerIds.includes(person.id));

  return (
    <main className="page">
      <Link to="/users" className="back-link">
        <Icon name="back" size={18} /> All users
      </Link>
      <div className="person-head">
        <span className="avatar" aria-hidden="true">
          {person.avatar}
        </span>
        <div>
          <h1>{person.name}</h1>
          <p className="field-hint">{person.role ? `Event role: ${person.role}` : 'No event role (Control Panel only)'}</p>
        </div>
      </div>

      <section className="card detail-section">
        <h2>Event access</h2>
        {person.access.length === 0 ? (
          <p className="field-hint">Cannot report or see events.</p>
        ) : (
          <ul className="detail-list">
            {person.access.map((entry) => (
              <li key={entry.plantId}>
                <strong>{getPlantName(organization, entry.plantId)}</strong>
                <span>{entry.pillarIds.map((id) => pillarLabel(reference, id)).join(', ')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card detail-section">
        <h2>Control Panel roles</h2>
        {person.controlPanelRoles.length === 0 ? (
          <p className="field-hint">No Control Panel role.</p>
        ) : (
          <ul className="detail-list">
            {person.controlPanelRoles.map((role) => (
              <li key={role.pillarId}>
                <strong>{pillarLabel(reference, role.pillarId)}</strong>
                <span>
                  <span className={`level-badge level-badge--${role.level}`}>{LEVEL_LABELS[role.level]}</span>{' '}
                  {describePlants(role.plantIds, organization, role.level)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card detail-section">
        <h2>Review groups</h2>
        {reviewGroups.length === 0 ? (
          <p className="field-hint">Not a reviewer in any workflow setting.</p>
        ) : (
          <ul className="detail-list">
            {reviewGroups.map((setting) => (
              <li key={setting.id}>
                <strong>
                  {pillarLabel(reference, setting.pillarId)} · {setting.levelCode} · {PHASE_LABELS[setting.phase]}
                </strong>
                <span>
                  Set at {LEVEL_LABELS[setting.scopeLevel]} for{' '}
                  {setting.scopeLevel === 'central'
                    ? 'all plants'
                    : describePlants(setting.plantIds, organization, setting.scopeLevel)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
