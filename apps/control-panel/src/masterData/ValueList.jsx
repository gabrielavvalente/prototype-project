import { useRef, useState } from 'react';
import { Button } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { allowedValueActions, isAvailable, visibleValues } from '../../../../shared/platform/masterData.js';
import { parseCsv, toCsv } from '../../../../shared/platform/csv.js';
import { importValues, setActivation, setValueStatus } from '../../../../shared/platform/platformData.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { getRole } from '../../../../shared/platform/permissions.js';
import Icon from '../shell/Icon.jsx';
import { describePlants } from '../shell/roleText.js';

const STATUS_TAGS = { Active: 'tag--teal', Inactive: 'tag--outline', Retired: 'tag--dark' };

// Saves text as a file in the browser's downloads.
function downloadFile(fileName, text) {
  // The byte order mark lets Excel open accents correctly.
  const url = URL.createObjectURL(new Blob(['﻿', text], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function countText(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// The values of one list: owner, status, availability at the chosen plant and the actions the
// user may take (FR-015 to FR-018). Body Parts are grouped by category.
export default function ValueList({ list, values, activations, plants, plantId, onPlantChange, canImport, onCreate, onEdit, onChanged }) {
  const { user, organization } = useApp();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [error, setError] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const fileInput = useRef(null);
  const role = getRole(user, list.pillarId);
  const myPlants = role ? describePlants(role, organization) : '';
  const plantName = getPlantName(organization, plantId);
  // Injuries are offered for some body parts only (012 MD-4, MD-11).
  const withParts = list.id === 'injuries';
  const bodyPartCount = (value) => {
    const count = (value.bodyPartIds || []).length;
    return `${count} body part${count === 1 ? '' : 's'}`;
  };

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

  // Every value shown, with the columns an import reads back (Code, Name, Description, Category);
  // Injuries add the body parts they are offered for (012 MD-12).
  function exportValues() {
    const categoryName = (value) => values.find((item) => item.id === value.parentId)?.name ?? '';
    const partNames = (value) => (value.bodyPartIds || []).map((id) => values.find((item) => item.id === id)?.name).filter(Boolean).join(' | ');
    const header = [...(list.hasCode ? ['Code'] : []), 'Name', 'Description', ...(list.parentListId ? ['Category'] : []), ...(withParts ? ['Body parts'] : []), 'Owner', 'Status', `Available at ${plantName}`];
    const rows = shown.map((value) => [
      ...(list.hasCode ? [value.code] : []),
      value.name,
      value.description,
      ...(list.parentListId ? [categoryName(value)] : []),
      ...(withParts ? [partNames(value)] : []),
      owner(value),
      value.status,
      isAvailable(value, values, activations, plantId) ? 'Yes' : 'No',
    ]);
    downloadFile(`${list.label.toLowerCase().replaceAll(' ', '-')}.csv`, toCsv([header, ...rows]));
  }

  async function importFile(file) {
    setError('');
    setImportErrors([]);
    try {
      const plan = await importValues(user, list.id, parseCsv(await file.text()));
      if (plan.errors.length > 0) {
        setImportErrors(plan.errors);
        return;
      }
      const added = plan.changes.filter((change) => !change.before).length;
      const skipped = plan.skipped.length > 0 ? `, ${plan.skipped.length} left unchanged (owned by another level)` : '';
      onChanged(`Import done: ${countText(added, 'value')} added, ${plan.changes.length - added} updated${skipped}.`);
    } catch (importError) {
      setError(importError.message);
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
        {withParts && <td>{bodyPartCount(value)}</td>}
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
      <div className="list-toolbar">
        <div className="field list-search">
          <label className="field-label" htmlFor="value-search">
            Search {list.label.toLowerCase()}
          </label>
          <input id="value-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="field list-availability">
          <label className="field-label" htmlFor="availability-plant">
            Availability for
          </label>
          <select id="availability-plant" value={plantId} onChange={(e) => onPlantChange(e.target.value)}>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="list-toolbar-actions">
          <button type="button" className="button button--secondary" onClick={exportValues} disabled={shown.length === 0}>
            Export CSV
          </button>
          {canImport && (
            <>
              <button type="button" className="button button--secondary" onClick={() => fileInput.current.click()}>
                Import CSV
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => {
                  if (e.target.files[0]) importFile(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </>
          )}
          {onCreate && (
            <Button type="button" className="button button--primary" leftSection={<Icon name="plus" size={18} />} onClick={onCreate}>
              Create {list.label}
            </Button>
          )}
        </div>
      </div>
      {canImport && (
        <p className="field-hint">
          Import reads the columns {list.hasCode && 'Code, '}Name, Description{list.parentListId && ', Category'}: a row
          with the {list.hasCode ? 'code' : 'name'} of one of your values changes it, other rows add values. Export
          first to get a file in the right format.
        </p>
      )}
      {error && (
        <p className="message message--error" role="alert">
          {error}
        </p>
      )}
      {importErrors.length > 0 && (
        <div className="message message--error" role="alert">
          <p>Nothing was imported. Fix these lines and import the file again:</p>
          <ul>
            {importErrors.map((item) => (
              <li key={item.line}>
                Line {item.line}: {item.message}
              </li>
            ))}
          </ul>
        </div>
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
              {withParts && <th scope="col">Body parts</th>}
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
