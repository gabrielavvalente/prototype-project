import { describe, expect, it } from 'vitest';
import { masterValues } from './catalogs.js';
import {
  allowedValueActions,
  availableValues,
  classificationValueName,
  getList,
  injuriesFor,
  injuryChoice,
  injuryOptions,
  keepInjuries,
  listsForPillar,
  normalizeValueStatus,
  planImport,
  validateValue,
} from './masterData.js';
import { users } from './sampleData.js';

const byId = (id) => users.find((user) => user.id === id);
const count = (listId) => masterValues.filter((value) => value.listId === listId).length;

function newValue(listId, fields) {
  return { id: 'new', listId, code: '', name: '', description: '', parentId: '', ownerLevel: 'central', ownerPlantIds: [], status: 'Active', ...fields };
}

describe('initial catalogs (FR-014)', () => {
  it('has the counts of the sources', () => {
    expect(count('standards')).toBe(12);
    expect(count('hazards')).toBe(16);
    expect(count('diseases')).toBe(17);
    expect(count('bodyPartCategories')).toBe(8);
    expect(count('injuries')).toBe(38);
    expect(count('aspects')).toBe(15);
    expect(count('impacts')).toBe(13);
    expect(count('irCategories')).toBe(11);
  });

  it('gives Standards and Hazards the workbook values with codes (012)', () => {
    const named = (listId) => masterValues.filter((value) => value.listId === listId).map((value) => `${value.code} ${value.name}`);
    expect(named('standards').at(0)).toBe('STD-01 Confined Spaces');
    expect(named('standards').at(-1)).toBe('STD-12 Control of contractors');
    expect(named('hazards').at(0)).toBe('HZ-01 Acts of violence');
    expect(named('hazards').at(-1)).toBe('HZ-16 Trapped by something collapsing / overturning');
    expect(masterValues.some((value) => value.name === 'Psychological pathology')).toBe(true);
    expect(listsForPillar('pillar-hs').map((list) => list.id)).toContain('diseases');
    expect(listsForPillar('pillar-ir').map((list) => list.id)).not.toContain('diseases');
  });

  it('offers the injuries of the chosen body parts (012 MD-4)', () => {
    const injuries = masterValues.filter((value) => value.listId === 'injuries');
    const part = (name) => masterValues.find((value) => value.listId === 'bodyParts' && value.name === name).id;
    expect(injuries.reduce((sum, injury) => sum + injury.bodyPartIds.length, 0)).toBe(423);
    const ear = injuriesFor(injuries, [part('Ear')]).map((injury) => injury.name);
    expect(ear).toHaveLength(12);
    expect(ear).toContain('Tinnitus (buzzing)');
    expect(ear).not.toContain('Fracture');
    expect(injuriesFor(injuries, [part('Ear'), part('Fingers')])).toHaveLength(17);
    expect(injuriesFor(injuries, [])).toEqual([]);
    expect(injuries.find((injury) => injury.name === 'Other').bodyPartIds).toHaveLength(36);
  });

  it('groups the injuries under each chosen body part, one choice per body part (012 RV-6)', () => {
    const injuries = masterValues.filter((value) => value.listId === 'injuries');
    const part = (name) => masterValues.find((value) => value.listId === 'bodyParts' && value.name === name);
    const bruise = injuries.find((injury) => injury.name === 'Bruise');
    const groups = injuryOptions(injuries, [part('Ear'), part('Fingers')]);
    expect(groups.map((group) => [group.group, group.items.length])).toEqual([['Ear', 12], ['Fingers', 14]]);
    expect(groups[0].items.find((item) => item.injury === 'Bruise').label).toBe('Ear: Bruise');
    const choices = groups.flatMap((group) => group.items.map((item) => item.value));
    expect(choices.filter((choice) => choice.endsWith(`>${bruise.id}`))).toHaveLength(2);
    expect(new Set(choices).size).toBe(choices.length);
    const earBruise = injuryChoice(part('Ear').id, bruise.id);
    expect(classificationValueName(masterValues, earBruise)).toBe('Ear: Bruise');
    expect(classificationValueName(masterValues, bruise.id)).toBe('Bruise');
    const fingersBruise = injuryChoice(part('Fingers').id, bruise.id);
    expect(keepInjuries([earBruise, fingersBruise], [part('Fingers').id])).toEqual([fingersBruise]);
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

describe('no Retire: deactivate and reactivate only (014 remarks)', () => {
  it('reads a value saved as Retired as Inactive', () => {
    expect(normalizeValueStatus({ id: 'v', status: 'Retired' }).status).toBe('Inactive');
    expect(normalizeValueStatus({ id: 'v', status: 'Active' }).status).toBe('Active');
  });
});

describe('availableValues (FR-018, FR-020)', () => {
  const clusterHazard = newValue('hazards', { id: 'h-cluster', code: 'X1', name: 'Cluster hazard', ownerLevel: 'cluster', ownerPlantIds: ['plant-lyon', 'plant-porto'] });
  const values = [
    ...masterValues.map((value) => (value.id === 'hazards-2' ? { ...value, status: 'Inactive' } : value)),
    clusterHazard,
  ];
  const activations = [
    { id: 'a1', valueId: 'hazards-1', scopeLevel: 'local', plantIds: ['plant-lyon'] },
    { id: 'a2', valueId: 'hazards-3', scopeLevel: 'cluster', plantIds: ['plant-lyon', 'plant-porto'] },
  ];
  const ids = (plantId) => availableValues(values, activations, { listId: 'hazards', plantId }).map((value) => value.id);

  it('applies the status, deactivations and cluster ownership per plant', () => {
    expect(ids('plant-lyon')).not.toContain('hazards-1');
    expect(ids('plant-lyon')).not.toContain('hazards-2');
    expect(ids('plant-lyon')).not.toContain('hazards-3');
    expect(ids('plant-lyon')).toContain('h-cluster');
    expect(ids('plant-porto')).toContain('hazards-1');
    expect(ids('plant-porto')).not.toContain('hazards-3');
    expect(ids('plant-curitiba')).toContain('hazards-3');
    expect(ids('plant-curitiba')).not.toContain('h-cluster');
    expect(ids('plant-lyon')).toHaveLength(16 - 3 + 1);
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
    expect(allowed('user-ludovic', hazards, centralHazard)).toEqual(['add', 'edit', 'deactivate']);
  });

  it('lets a Cluster add, manage its own values and switch Central ones off for its plants', () => {
    expect(allowed('user-lucas', hazards, lucasHazard)).toEqual(['add', 'edit', 'deactivate']);
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
    expect(allowed('user-ludovic', getList('bodyParts'), bodyPart)).toEqual(['add', 'edit', 'deactivate']);
  });

  it('gives Industrial Risk nothing on the H&S lists it shows', () => {
    const readOnlyHazards = listsForPillar('pillar-ir').find((list) => list.id === 'hazards');
    expect(allowed('user-sergio', readOnlyHazards, centralHazard)).toEqual([]);
  });
});

describe('validateValue (FR-019, FR-020)', () => {
  it('refuses a duplicate code, a missing name and a missing code', () => {
    const errors = validateValue(getList('hazards'), newValue('hazards', { code: 'hz-01', name: '' }), masterValues);
    expect(errors).toEqual({ name: 'Enter a name.', code: 'A value with code hz-01 already exists.' });
    expect(validateValue(getList('standards'), newValue('standards', { name: 'New' }), masterValues)).toEqual({ code: 'Enter a code.' });
  });

  it('allows the same code in another owner scope', () => {
    const clusterValue = newValue('hazards', { code: 'HZ-01', name: 'Local variant', ownerLevel: 'cluster', ownerPlantIds: ['plant-lyon', 'plant-porto'] });
    expect(validateValue(getList('hazards'), clusterValue, masterValues)).toEqual({});
  });

  it('requires an injury to be linked to at least one body part (012 MD-5)', () => {
    const injuries = getList('injuries');
    expect(validateValue(injuries, newValue('injuries', { name: 'Frostbite' }), masterValues)).toEqual({ bodyPartIds: 'Choose at least one body part.' });
    expect(validateValue(injuries, newValue('injuries', { name: 'Frostbite', bodyPartIds: ['bodyParts-1'] }), masterValues)).toEqual({});
    expect(validateValue(getList('hazards'), newValue('hazards', { code: 'HZ-99', name: 'New' }), masterValues)).toEqual({});
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

describe('planImport (review 2026-10-25)', () => {
  const standards = getList('standards');

  it('changes Central values for Central and adds new codes', () => {
    const rows = [
      { code: 'STD-01', name: 'Confined Spaces', description: 'Updated' },
      { code: 'STD-99', name: 'New standard', description: '' },
    ];
    const plan = planImport(byId('user-ludovic'), standards, rows, masterValues);
    expect(plan.errors).toEqual([]);
    expect(plan.changes.map((change) => [change.before?.id ?? null, change.after.code])).toEqual([
      ['standards-1', 'STD-01'],
      [null, 'STD-99'],
    ]);
  });

  it('skips unchanged rows', () => {
    const plan = planImport(byId('user-ludovic'), standards, [{ code: 'STD-01', name: 'Confined Spaces' }], masterValues);
    expect(plan.changes).toEqual([]);
  });

  it('never copies Central values for a Cluster', () => {
    const rows = [{ code: 'STD-01', name: 'Confined Spaces' }, { code: 'LY-1', name: 'Lyon rule' }];
    const plan = planImport(byId('user-lucas'), standards, rows, masterValues);
    expect(plan.skipped.map((item) => item.line)).toEqual([2]);
    expect(plan.changes[0].after).toMatchObject({ code: 'LY-1', ownerLevel: 'cluster' });
  });

  it('reports each row with a problem by its line', () => {
    const rows = [{ code: '', name: 'No code' }, { code: 'STD-98', name: 'A' }, { code: 'STD-98', name: 'B' }];
    const plan = planImport(byId('user-ludovic'), standards, rows, masterValues);
    expect(plan.errors.map((item) => item.line)).toEqual([2, 4]);
    expect(plan.changes.map((change) => change.after.name)).toEqual(['A']);
  });

  it('reads the body parts of an injury by name (012 MD-13)', () => {
    const injuries = getList('injuries');
    const rows = [
      { name: 'Frostbite', 'body parts': 'fingers | Toe(s)' },
      { name: 'Chilblain', 'body parts': '' },
      { name: 'Scale burn', 'body parts': 'Tail' },
      { name: 'Hearing Loss', 'body parts': 'Ear' },
    ];
    const plan = planImport(byId('user-ludovic'), injuries, rows, masterValues);
    const fingers = masterValues.find((value) => value.listId === 'bodyParts' && value.name === 'Fingers').id;
    expect(plan.changes.map((change) => change.after.name)).toEqual(['Frostbite']);
    expect(plan.changes[0].after.bodyPartIds).toContain(fingers);
    expect(plan.changes[0].after.bodyPartIds).toHaveLength(2);
    expect(plan.errors).toEqual([
      { line: 3, message: 'Choose at least one body part.' },
      { line: 4, message: 'Unknown body part: Tail.' },
    ]);
  });

  it('finds the Body Part category by name', () => {
    const rows = [{ name: 'Left ear', category: 'head' }, { name: 'Tail', category: 'Unknown' }];
    const plan = planImport(byId('user-ludovic'), getList('bodyParts'), rows, masterValues);
    expect(plan.changes).toHaveLength(1);
    expect(plan.errors).toEqual([{ line: 3, message: 'Choose a category.' }]);
  });
});
