import { describe, expect, it } from 'vitest';
import { masterValues } from './catalogs.js';
import { allowedValueActions, availableValues, getList, listsForPillar, validateValue } from './masterData.js';
import { users } from './sampleData.js';

const byId = (id) => users.find((user) => user.id === id);
const count = (listId) => masterValues.filter((value) => value.listId === listId).length;

function newValue(listId, fields) {
  return { id: 'new', listId, code: '', name: '', description: '', parentId: '', ownerLevel: 'central', ownerPlantIds: [], status: 'Active', ...fields };
}

describe('initial catalogs (FR-014)', () => {
  it('has the counts of the sources', () => {
    expect(count('standards')).toBe(14);
    expect(count('hazards')).toBe(36);
    expect(count('bodyPartCategories')).toBe(8);
    expect(count('injuries')).toBe(38);
    expect(count('aspects')).toBe(15);
    expect(count('impacts')).toBe(13);
    expect(count('irCategories')).toBe(11);
  });

  it('puts every Body Part in a category', () => {
    const categoryIds = masterValues.filter((value) => value.listId === 'bodyPartCategories').map((value) => value.id);
    expect(masterValues.filter((value) => value.listId === 'bodyParts').every((value) => categoryIds.includes(value.parentId))).toBe(true);
  });

  it('shows H&S Standards and Hazards read-only in Industrial Risk (FR-021)', () => {
    const lists = listsForPillar('pillar-ir');
    expect(lists.map((list) => `${list.id}${list.readOnly ? ' (read-only)' : ''}`)).toEqual([
      'irCategories',
      'standards (read-only)',
      'hazards (read-only)',
    ]);
    expect(listsForPillar('pillar-ih')).toEqual([]);
  });
});

describe('availableValues (FR-018, FR-020)', () => {
  const clusterHazard = newValue('hazards', { id: 'h-cluster', code: 'X1', name: 'Cluster hazard', ownerLevel: 'cluster', ownerPlantIds: ['plant-lyon', 'plant-porto'] });
  const values = [
    ...masterValues.map((value) => (value.id === 'hazards-2' ? { ...value, status: 'Retired' } : value)),
    clusterHazard,
  ];
  const activations = [
    { id: 'a1', valueId: 'hazards-1', scopeLevel: 'local', plantIds: ['plant-lyon'] },
    { id: 'a2', valueId: 'hazards-3', scopeLevel: 'cluster', plantIds: ['plant-lyon', 'plant-porto'] },
  ];
  const ids = (plantId) => availableValues(values, activations, { listId: 'hazards', plantId }).map((value) => value.id);

  it('applies retirement, deactivations and cluster ownership per plant', () => {
    expect(ids('plant-lyon')).not.toContain('hazards-1');
    expect(ids('plant-lyon')).not.toContain('hazards-2');
    expect(ids('plant-lyon')).not.toContain('hazards-3');
    expect(ids('plant-lyon')).toContain('h-cluster');
    expect(ids('plant-porto')).toContain('hazards-1');
    expect(ids('plant-porto')).not.toContain('hazards-3');
    expect(ids('plant-curitiba')).toContain('hazards-3');
    expect(ids('plant-curitiba')).not.toContain('h-cluster');
    expect(ids('plant-lyon')).toHaveLength(36 - 3 + 1);
  });

  it('hides the Body Parts of an inactive category', () => {
    const withInactiveHead = values.map((value) => (value.id === 'bodyPartCategories-1' ? { ...value, status: 'Inactive' } : value));
    const parts = availableValues(withInactiveHead, [], { listId: 'bodyParts', plantId: 'plant-lyon' });
    expect(parts.some((value) => value.parentId === 'bodyPartCategories-1')).toBe(false);
    expect(parts).toHaveLength(count('bodyParts') - 8);
  });
});

describe('allowedValueActions (FR-015, FR-016)', () => {
  const hazards = getList('hazards');
  const centralHazard = masterValues.find((value) => value.id === 'hazards-1');
  const lucasHazard = newValue('hazards', { id: 'h-lucas', ownerLevel: 'cluster', ownerPlantIds: ['plant-lyon', 'plant-porto'] });
  const allowed = (userId, list, value, activations) =>
    Object.entries(allowedValueActions(byId(userId), list, value, activations))
      .filter(([, yes]) => yes)
      .map(([action]) => action);

  it('gives Central full control', () => {
    expect(allowed('user-ludovic', hazards, centralHazard)).toEqual(['add', 'edit', 'deactivate', 'retire']);
  });

  it('lets a Cluster add, manage its own values and switch Central ones off for its plants', () => {
    expect(allowed('user-lucas', hazards, lucasHazard)).toEqual(['add', 'edit', 'deactivate', 'retire']);
    expect(allowed('user-lucas', hazards, centralHazard)).toEqual(['add', 'deactivateHere']);
  });

  it('lets a Local only switch values off and on for its plant', () => {
    expect(allowed('user-eva', hazards, centralHazard)).toEqual(['deactivateHere']);
    const evaChoice = [{ id: 'a', valueId: 'hazards-1', scopeLevel: 'local', plantIds: ['plant-lyon'] }];
    expect(allowed('user-eva', hazards, centralHazard, evaChoice)).toEqual(['reactivateHere']);
    // A Cluster's choice is not the Local's to undo.
    const clusterChoice = [{ id: 'b', valueId: 'hazards-1', scopeLevel: 'cluster', plantIds: ['plant-lyon', 'plant-porto'] }];
    expect(allowed('user-eva', hazards, centralHazard, clusterChoice)).toEqual(['deactivateHere']);
  });

  it('keeps fixed global lists for Central only', () => {
    const bodyPart = masterValues.find((value) => value.listId === 'bodyParts');
    expect(allowed('user-lucas', getList('bodyParts'), bodyPart)).toEqual([]);
    expect(allowed('user-ludovic', getList('bodyParts'), bodyPart)).toEqual(['add', 'edit', 'deactivate', 'retire']);
  });

  it('gives Industrial Risk nothing on the H&S lists it shows', () => {
    const readOnlyHazards = listsForPillar('pillar-ir').find((list) => list.id === 'hazards');
    expect(allowed('user-sergio', readOnlyHazards, centralHazard)).toEqual([]);
  });
});

describe('validateValue (FR-019, FR-020)', () => {
  it('refuses a duplicate code, a missing name and a missing code', () => {
    const errors = validateValue(getList('hazards'), newValue('hazards', { code: 'a1', name: '' }), masterValues);
    expect(errors).toEqual({ name: 'Enter a name.', code: 'A value with code a1 already exists.' });
    expect(validateValue(getList('standards'), newValue('standards', { name: 'New' }), masterValues)).toEqual({ code: 'Enter a code.' });
  });

  it('allows the same code in another owner scope', () => {
    const clusterValue = newValue('hazards', { code: 'A1', name: 'Local variant', ownerLevel: 'cluster', ownerPlantIds: ['plant-lyon', 'plant-porto'] });
    expect(validateValue(getList('hazards'), clusterValue, masterValues)).toEqual({});
  });

  it('refuses a duplicate name in lists without codes', () => {
    expect(validateValue(getList('impacts'), newValue('impacts', { name: 'hazardous waste' }), masterValues)).toEqual({
      name: '"hazardous waste" already exists in this list.',
    });
  });

  it('needs a category for a Body Part, which must be active', () => {
    const list = getList('bodyParts');
    expect(validateValue(list, newValue('bodyParts', { name: 'Chin' }), masterValues)).toEqual({ parentId: 'Choose a category.' });
    const inactive = masterValues.map((value) => (value.id === 'bodyPartCategories-1' ? { ...value, status: 'Inactive' } : value));
    expect(validateValue(list, newValue('bodyParts', { name: 'Chin', parentId: 'bodyPartCategories-1' }), inactive)).toEqual({
      parentId: 'The category is not active, so this value cannot be active.',
    });
  });
});
