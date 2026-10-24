import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getPlantName, getPlants } from '../../../../shared/platform/organization.js';
import { canSeeUser, LEVEL_LABELS } from '../../../../shared/platform/permissions.js';
import { eventPillarIds, eventPlantIds, getPillars, pillarCode, roleBadge } from '../shell/text.js';

const EVENT_ROLES = ['User', 'Manager', 'Site Admin'];

// Plants a user is linked to, by event access or Control Panel role (Central: every plant).
function linkedPlantIds(user, allPlantIds) {
  const rolePlants = user.controlPanelRoles.flatMap((role) => (role.level === 'central' ? allPlantIds : role.plantIds));
  return new Set([...eventPlantIds(user), ...rolePlants]);
}

function linkedPillarIds(user) {
  return new Set([...eventPillarIds(user), ...user.controlPanelRoles.map((role) => role.pillarId)]);
}

// role filter values: an event role ("Manager") or a Control Panel level ("cp-cluster").
function hasRole(user, role) {
  if (role.startsWith('cp-')) {
    return user.controlPanelRoles.some((item) => item.level === role.slice(3));
  }
  return user.role === role;
}

// Read-only users list within the signed-in person's perimeter (FR-027).
export default function UsersList() {
  const { user: viewer, users, organization, reference } = useApp();
  const [query, setQuery] = useState('');
  const [plantId, setPlantId] = useState('');
  const [pillarId, setPillarId] = useState('');
  const [role, setRole] = useState('');
  const plants = getPlants(organization);
  const allPlantIds = plants.map((plant) => plant.id);

  useEffect(() => {
    document.title = 'Users — User Management';
  }, []);

  const visible = users
    .filter((user) => canSeeUser(viewer, user))
    .filter((user) => user.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((user) => !plantId || linkedPlantIds(user, allPlantIds).has(plantId))
    .filter((user) => !pillarId || linkedPillarIds(user).has(pillarId))
    .filter((user) => !role || hasRole(user, role))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="page">
      <h1>Users</h1>
      <p className="field-hint">
        Who can report and see events, and who holds a Control Panel role. Read-only.
      </p>
      <div className="filter-row">
        <div className="field">
          <label className="field-label" htmlFor="user-search">
            Search by name
          </label>
          <input id="user-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="filter-plant">
            Plant
          </label>
          <select id="filter-plant" value={plantId} onChange={(e) => setPlantId(e.target.value)}>
            <option value="">All plants</option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="filter-pillar">
            Pillar
          </label>
          <select id="filter-pillar" value={pillarId} onChange={(e) => setPillarId(e.target.value)}>
            <option value="">All pillars</option>
            {getPillars(reference).map((pillar) => (
              <option key={pillar.id} value={pillar.id}>
                {pillar.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="filter-role">
            Role
          </label>
          <select id="filter-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <optgroup label="Event role">
              {EVENT_ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </optgroup>
            <optgroup label="Control Panel">
              {Object.entries(LEVEL_LABELS).map(([level, label]) => (
                <option key={level} value={`cp-${level}`}>
                  {label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <p className="result-count" role="status">
        {visible.length} user{visible.length === 1 ? '' : 's'}
      </p>
      <div className="table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Event role</th>
              <th scope="col">Plants</th>
              <th scope="col">Pillars</th>
              <th scope="col">Control Panel roles</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((user) => (
              <tr key={user.id}>
                <th scope="row">
                  <Link to={`/users/${user.id}`} className="user-link">
                    <span className="avatar avatar--small" aria-hidden="true">
                      {user.avatar}
                    </span>
                    {user.name}
                  </Link>
                </th>
                <td>{user.role || '—'}</td>
                <td>{eventPlantIds(user).map((id) => getPlantName(organization, id)).join(', ') || '—'}</td>
                <td>{eventPillarIds(user).map((id) => pillarCode(reference, id)).join(', ') || '—'}</td>
                <td>
                  <span className="tag-row">
                    {user.controlPanelRoles.length === 0 && '—'}
                    {user.controlPanelRoles.map((item) => (
                      <span key={item.pillarId} className={`level-badge level-badge--${item.level}`}>
                        {roleBadge(item, reference)}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
