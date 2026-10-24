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
