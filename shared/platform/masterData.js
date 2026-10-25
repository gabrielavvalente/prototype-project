// Master data rules (spec FR-013 to FR-021): the lists of each pillar, who may do what, which
// values a plant can use, and value validation.
// The owner of a value changes its status (Active, Inactive, Retired). Other levels switch it off
// for their own plants with an "activation choice" (a deactivation for a scope).
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import { getRole, plantsOverlap } from './permissions.js';

export const LISTS = [
  { id: 'standards', pillarId: 'pillar-hs', label: 'Standards', fixedGlobal: false, hasCode: true },
  { id: 'hazards', pillarId: 'pillar-hs', label: 'Hazards', fixedGlobal: false, hasCode: true },
  { id: 'bodyPartCategories', pillarId: 'pillar-hs', label: 'Body Part Categories', fixedGlobal: true, hasCode: false },
  {
    id: 'bodyParts',
    pillarId: 'pillar-hs',
    label: 'Body Parts',
    fixedGlobal: true,
    hasCode: false,
    parentListId: 'bodyPartCategories',
  },
  { id: 'injuries', pillarId: 'pillar-hs', label: 'Injuries', fixedGlobal: true, hasCode: false },
  { id: 'aspects', pillarId: 'pillar-env', label: 'Aspects', fixedGlobal: false, hasCode: false },
  { id: 'impacts', pillarId: 'pillar-env', label: 'Impacts', fixedGlobal: false, hasCode: false },
  { id: 'irCategories', pillarId: 'pillar-ir', label: 'Categories', fixedGlobal: false, hasCode: true },
];

export const STATUSES = ['Active', 'Inactive', 'Retired'];

export function getList(listId) {
  return LISTS.find((list) => list.id === listId);
}

// The lists shown in a pillar's panel. Industrial Risk also shows the Health & Safety Standards
// and Hazards, read-only (FR-021). Industrial Hygiene has none yet.
export function listsForPillar(pillarId) {
  const own = LISTS.filter((list) => list.pillarId === pillarId).map((list) => ({ ...list, readOnly: false }));
  if (pillarId === 'pillar-ir') {
    const shared = ['standards', 'hazards'].map((id) => ({ ...getList(id), readOnly: true }));
    return [...own, ...shared];
  }
  return own;
}

// A deactivation applies to a plant when made by Central or when its plants include the plant.
function activationApplies(activation, plantId) {
  return activation.scopeLevel === 'central' || activation.plantIds.includes(plantId);
}

function ownedForPlant(value, plantId) {
  return value.ownerLevel === 'central' || value.ownerPlantIds.includes(plantId);
}

// Whether one value can be used at a plant (FR-018, FR-020).
export function isAvailable(value, values, activations, plantId) {
  if (value.status !== 'Active' || !ownedForPlant(value, plantId)) {
    return false;
  }
  if (activations.some((activation) => activation.valueId === value.id && activationApplies(activation, plantId))) {
    return false;
  }
  if (value.parentId) {
    const parent = values.find((item) => item.id === value.parentId);
    return Boolean(parent) && isAvailable(parent, values, activations, plantId);
  }
  return true;
}

export function availableValues(values, activations, { listId, plantId }) {
  return values.filter((value) => value.listId === listId && isAvailable(value, values, activations, plantId));
}

// The values a user sees in a list: Central values and those of Clusters sharing a plant with
// them (Central sees all).
export function visibleValues(user, list, values) {
  const role = getRole(user, list.pillarId);
  return values.filter(
    (value) =>
      value.listId === list.id &&
      (value.ownerLevel === 'central' || !role || role.level === 'central' || plantsOverlap(value.ownerPlantIds, role.plantIds)),
  );
}

// The activation choice the user's level made for a value, if any.
export function ownActivation(user, list, value, activations) {
  const role = getRole(user, list.pillarId);
  return activations.find(
    (activation) =>
      activation.valueId === value.id &&
      activation.scopeLevel === role.level &&
      (role.level === 'central' || plantsOverlap(activation.plantIds, role.plantIds)),
  );
}

function isOwner(role, value) {
  if (value.ownerLevel === 'central') {
    return role.level === 'central';
  }
  return role.level === 'cluster' && plantsOverlap(role.plantIds, value.ownerPlantIds);
}

// What the user may do with a list and one of its values (FR-015, FR-016, FR-021).
// value is null to ask only about adding.
export function allowedValueActions(user, list, value, activations = []) {
  const none = {
    add: false,
    edit: false,
    deactivate: false,
    reactivate: false,
    retire: false,
    deactivateHere: false,
    reactivateHere: false,
  };
  const role = getRole(user, list.pillarId);
  if (!role || list.readOnly) {
    return none;
  }
  if (list.fixedGlobal && role.level !== 'central') {
    return none;
  }
  const add = role.level === 'central' || role.level === 'cluster';
  if (!value || value.status === 'Retired') {
    return { ...none, add };
  }
  const owner = isOwner(role, value);
  // Someone else's value: switched off or on for the user's own plants only.
  const ownChoice = ownActivation(user, list, value, activations);
  return {
    add,
    edit: owner,
    deactivate: owner && value.status === 'Active',
    reactivate: owner && value.status === 'Inactive',
    retire: owner,
    deactivateHere: !owner && !ownChoice,
    reactivateHere: !owner && Boolean(ownChoice),
  };
}

function sameScope(a, b) {
  return a.ownerLevel === b.ownerLevel && [...a.ownerPlantIds].sort().join() === [...b.ownerPlantIds].sort().join();
}

// Turns the rows of an imported file into values to add or change (review 2026-10-25).
// rows: [{ code, name, description, category }] as read by parseCsv. A row changes the value of
// the user's own level with the same code (or name, for lists without codes) and adds one
// otherwise. A row matching someone else's value is skipped, so re-importing an exported file
// never copies Central values. Returns { changes: [{ before, after }], skipped, errors }; the
// caller saves nothing when errors is not empty.
export function planImport(user, list, rows, values) {
  const role = getRole(user, list.pillarId);
  const scope = { ownerLevel: role.level, ownerPlantIds: role.level === 'central' ? [] : role.plantIds };
  const keyOf = (item) => (list.hasCode ? item.code : item.name).trim().toLowerCase();
  const categories = values.filter((item) => item.listId === list.parentListId);
  const seen = visibleValues(user, list, values);
  let known = [...values];
  const keysInFile = new Set();
  const result = { changes: [], skipped: [], errors: [] };

  rows.forEach((row, index) => {
    const line = index + 2; // line 1 is the header
    const fields = { code: list.hasCode ? row.code || '' : '', name: row.name || '', description: row.description || '' };
    if (list.parentListId) {
      const category = categories.find((item) => item.name.toLowerCase() === (row.category || '').toLowerCase());
      fields.parentId = category ? category.id : '';
    }
    if (keysInFile.has(keyOf(fields))) {
      result.errors.push({ line, message: `${fields.code || fields.name} appears more than once in the file.` });
      return;
    }
    keysInFile.add(keyOf(fields));
    const sameKey = (item) => item.status !== 'Retired' && keyOf(item) === keyOf(fields);
    const existing = known.find((item) => item.listId === list.id && sameScope(item, scope) && sameKey(item));
    if (!existing && seen.some((item) => !sameScope(item, scope) && sameKey(item))) {
      result.skipped.push({ line, message: `${fields.code || fields.name} belongs to another level and was left unchanged.` });
      return;
    }
    if (existing && Object.keys(fields).every((field) => existing[field] === fields[field])) {
      return;
    }
    const value = existing
      ? { ...existing, ...fields }
      : { id: crypto.randomUUID(), listId: list.id, parentId: '', ...fields, ...scope, status: 'Active' };
    const problems = validateValue(list, value, known);
    if (Object.keys(problems).length > 0) {
      result.errors.push({ line, message: Object.values(problems).join(' ') });
      return;
    }
    known = [...known.filter((item) => item.id !== value.id), value];
    result.changes.push({ before: existing || null, after: value });
  });
  return result;
}

// Problems with a value before saving, as { field: message } (FR-019, FR-020).
export function validateValue(list, value, existingValues) {
  const errors = {};
  const others = existingValues.filter(
    (item) => item.listId === list.id && item.id !== value.id && sameScope(item, value) && item.parentId === value.parentId,
  );
  if (!value.name.trim()) {
    errors.name = 'Enter a name.';
  } else if (!list.hasCode && others.some((item) => item.name.trim().toLowerCase() === value.name.trim().toLowerCase())) {
    errors.name = `"${value.name.trim()}" already exists in this list.`;
  }
  if (list.hasCode) {
    if (!value.code.trim()) {
      errors.code = 'Enter a code.';
    } else if (others.some((item) => item.code.trim().toLowerCase() === value.code.trim().toLowerCase())) {
      errors.code = `A value with code ${value.code.trim()} already exists.`;
    }
  }
  if (list.parentListId) {
    const parent = existingValues.find((item) => item.id === value.parentId);
    if (!parent) {
      errors.parentId = 'Choose a category.';
    } else if (value.status === 'Active' && parent.status !== 'Active') {
      errors.parentId = 'The category is not active, so this value cannot be active.';
    }
  }
  return errors;
}
