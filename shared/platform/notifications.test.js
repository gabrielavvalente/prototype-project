import { describe, expect, it } from 'vitest';
import {
  canChangeSetting,
  canManagePlant,
  describeRule,
  INFORMATION_ALERTS,
  levelsOfPillar,
  peopleOfPlant,
  ruleRecipientIds,
  ruleRecipientOptions,
  settingFor,
  validateRule,
  WORK_ALERTS,
} from './notifications.js';
import { organization, reference, users } from './sampleData.js';

const person = (id) => users.find((user) => user.id === id);

describe('alert catalogue (NT-2, NT-4)', () => {
  it('has four work alerts and ten information alerts', () => {
    expect(WORK_ALERTS).toHaveLength(4);
    expect(INFORMATION_ALERTS.map((alert) => alert.key)).toHaveLength(10);
  });
});

describe('settings (NT-5)', () => {
  it('is on, set by nobody, until someone changes it', () => {
    expect(settingFor([], 'user-ana', 'Event closed')).toEqual({ on: true, setById: null, setAt: null });
    const settings = [{ userId: 'user-ana', type: 'Event closed', on: false, setById: 'user-eva', setAt: 'x' }];
    expect(settingFor(settings, 'user-ana', 'Event closed')).toEqual({ on: false, setById: 'user-eva', setAt: 'x' });
  });

  it('lets the person and a Site Admin of their plant change information alerts only (research R7)', () => {
    expect(canChangeSetting(person('user-ana'), person('user-ana'), 'Event closed')).toBe(true);
    expect(canChangeSetting(person('user-eva'), person('user-ana'), 'Event closed')).toBe(true);
    expect(canChangeSetting(person('user-eva'), person('user-ben'), 'Event closed')).toBe(false);
    expect(canChangeSetting(person('user-carla'), person('user-ana'), 'Event closed')).toBe(false);
    expect(canChangeSetting(person('user-ana'), person('user-ana'), 'Event to review')).toBe(false);
  });
});

describe('Site Admins (NT-6, NT-10)', () => {
  it('manage the plants of their access only', () => {
    expect(canManagePlant(person('user-eva'), 'plant-lyon')).toBe(true);
    expect(canManagePlant(person('user-eva'), 'plant-porto')).toBe(false);
    expect(canManagePlant(person('user-carla'), 'plant-lyon')).toBe(false);
  });

  it('see the people with an event role of the plant', () => {
    expect(peopleOfPlant(users, 'plant-lyon').map((user) => user.name)).toEqual([
      'Ana Ribeiro',
      'Carla Mendes',
      'Diego Laurent',
      'Eva Novak',
      'Lucas Weber',
    ]);
  });
});

describe('submission rules (NT-7, NT-9)', () => {
  const rule = {
    plantId: 'plant-lyon',
    pillarId: 'pillar-hs',
    levelCodes: ['TF1', 'TF2'],
    departmentIds: ['plant-lyon/department-2'],
    userIds: ['user-ana'],
  };
  const event = (levelCode, department) => ({
    plantId: 'plant-lyon',
    pillarId: 'pillar-hs',
    levelCode,
    location: { departmentId: `plant-lyon/department-${department}` },
  });

  it('refuses a rule without level or people', () => {
    expect(validateRule({ levelCodes: [], userIds: [] })).toEqual({
      levelCodes: 'Choose at least one level.',
      userIds: 'Choose at least one person.',
    });
    expect(validateRule(rule)).toEqual({});
  });

  it('matches by plant, pillar, level and department', () => {
    expect(ruleRecipientIds([rule], event('TF2', 2))).toEqual(['user-ana']);
    expect(ruleRecipientIds([rule], event('TF2', 1))).toEqual([]);
    expect(ruleRecipientIds([rule], event('TF4', 2))).toEqual([]);
    expect(ruleRecipientIds([{ ...rule, departmentIds: [] }], event('TF2', 1))).toEqual(['user-ana']);
  });

  it('offers the pillar levels and the people who see the plant and pillar', () => {
    expect(levelsOfPillar(reference, 'pillar-ih').map((level) => level.code)).toEqual(['OH-RESP', 'OH-SKIN', 'OH-MSD', 'OH-HEAR']);
    expect(ruleRecipientOptions(users, 'plant-lyon', 'pillar-ir').map((user) => user.name)).toEqual([
      'Ana Ribeiro',
      'Carla Mendes',
      'Diego Laurent',
      'Eva Novak',
    ]);
  });

  it('describes a rule', () => {
    expect(describeRule(rule, { organization, users })).toBe('Levels: TF1, TF2 · Departments: Logistics · People: Ana Ribeiro');
    expect(describeRule({ ...rule, departmentIds: [] }, { organization, users })).toContain('Departments: All departments');
  });
});
