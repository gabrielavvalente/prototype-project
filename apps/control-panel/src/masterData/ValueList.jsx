import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { allowedValueActions, isAvailable, visibleValues } from '../../../../shared/platform/masterData.js';
import { setActivation, setValueStatus } from '../../../../shared/platform/platformData.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { getRole } from '../../../../shared/platform/permissions.js';
import { describePlants } from '../shell/roleText.js';

const STATUS_TAGS = { Active: 'tag--teal', Inactive: 'tag--outline', Retired: 'tag--dark' };

// The values of one list: owner, status, availability at the chosen plant and the actions the
// user may take (FR-015 to FR-018). Body Parts are grouped by category.
export default function ValueList({ list, values, activations, plantId, onEdit, onChanged }) {
  const { user, organization } = useApp();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const role = getRole(user, list.pillarId);
  const myPlants = role ? describePlants(role, organization) : '';
  const plantName = getPlantName(organization, plantId);

  const words = query.trim().toLowerCase();
  // By code when the list has codes (A1, A2… IRC10 after IRC9), otherwise by name.
  const shown = visibleValues(user, list, values)
    .filter((value) => !words || `${value.code} ${value.name}`.toLowerCase().includes(words))
    .sort((a, b) => (a.code || a.name).localeCompare(b.code || b.name, 'en', { numeric: true }));

  async function run(action, message) {
    setError('');
    try {
      await action();
      onChanged(message);
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  function owner(value) {
    if (value.ownerLevel === 'central') {
      return 'Central';
    }
    return `Cluster ${value.ownerPlantIds.map((id) => getPlantName(organization, id)).join(', ')}`;
  }

  function actionsFor(value) {
    const allowed = allowedValueActions(user, list, value, activations);
    const buttons = [];
    if (allowed.edit) {
      buttons.push(['Edit', () => onEdit(value)]);
    }
    if (allowed.deactivate) {
      buttons.push(['Deactivate', () => run(() => setValueStatus(user, list.id, value.id, 'Inactive'), `${value.name} is now Inactive everywhere it was used.`)]);
    }
    if (allowed.reactivate) {
      buttons.push(['Reactivate', () => run(() => setValueStatus(user, list.id, value.id, 'Active'), `${value.name} is Active again.`)]);
    }
    if (allowed.deactivateHere) {
      buttons.push([`Deactivate for ${myPlants}`, () => run(() => setActivation(user, list.id, value.id, false), `${value.name} is deactivated for ${myPlants}.`)]);
    }
    if (allowed.reactivateHere) {
      buttons.push([`Reactivate for ${myPlants}`, () => run(() => setActivation(user, list.id, value.id, true), `${value.name} is active again for ${myPlants}.`)]);
    }
    if (allowed.retire) {
      buttons.push([
        'Retire',
        () => {
          if (window.confirm(`Retire ${value.name}? It will no longer be offered anywhere, and this cannot be undone.`)) {
            run(() => setValueStatus(user, list.id, value.id, 'Retired'), `${value.name} was retired.`);
          }
        },
      ]);
    }
    return buttons;
  }

  function renderRow(value) {
    const available = isAvailable(value, values, activations, plantId);
    const buttons = actionsFor(value);
    return (
      <tr key={value.id} className={value.status === 'Retired' ? 'row--retired' : ''}>
        {list.hasCode && <td className="cell-code">{value.code}</td>}
        <th scope="row">
          {value.name}
          {value.description && <small>{value.description}</small>}
        </th>
        <td>{owner(value)}</td>
        <td>
          <span className={`tag ${STATUS_TAGS[value.status]}`}>{value.status}</span>
        </td>
        <td>{available ? 'Yes' : <span className="muted">No</span>}</td>
        <td>
          <div className="row-actions">
            {buttons.length === 0 && <span className="muted">—</span>}
            {buttons.map(([label, handler]) => (
              <button key={label} type="button" className="button button--secondary button--small" onClick={handler}>
                {label}
                <span className="visually-hidden"> {value.name}</span>
              </button>
            ))}
          </div>
        </td>
      </tr>
    );
  }

  const columnCount = list.hasCode ? 6 : 5;
  const categories = list.parentListId ? values.filter((item) => item.listId === list.parentListId) : [];

  return (
    <>
      <div className="field list-search">
        <label className="field-label" htmlFor="value-search">
          Search {list.label.toLowerCase()}
        </label>
        <input id="value-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {error && (
        <p className="message message--error" role="alert">
          {error}
        </p>
      )}
      <p className="result-count">
        {shown.length} value{shown.length === 1 ? '' : 's'}
      </p>
      <div className="grid-card">
        <table className="values-table">
          <thead>
            <tr>
              {list.hasCode && <th scope="col">Code</th>}
              <th scope="col">Name</th>
              <th scope="col">Owner</th>
              <th scope="col">Status</th>
              <th scope="col">Available at {plantName}</th>
              <th scope="col" className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.parentListId
              ? categories.map((category) => {
                  const rows = shown.filter((value) => value.parentId === category.id);
                  return rows.length === 0
                    ? null
                    : [
                        <tr key={category.id} className="group-row">
                          <th scope="colgroup" colSpan={columnCount}>
                            {category.name}
                            {category.status !== 'Active' && ` (${category.status})`}
                          </th>
                        </tr>,
                        ...rows.map(renderRow),
                      ];
                })
              : shown.map(renderRow)}
          </tbody>
        </table>
      </div>
    </>
  );
}
