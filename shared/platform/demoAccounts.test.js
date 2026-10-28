import { describe, expect, it } from 'vitest';
import { accountPeople, accountPlants, accountRoles, roleLevels, rolePeople, rolePillars } from './demoAccounts.js';
import { organization, reference, users } from './sampleData.js';

const names = (people) => people.map((user) => user.name);

describe('demo sign-in choices (012 PD-7)', () => {
  it('asks the plant, the event role, then the person', () => {
    expect(accountPlants(users, organization).map((plant) => plant.name)).toEqual(['Curitiba', 'Lyon', 'Porto']);
    expect(accountRoles(users, 'plant-lyon')).toEqual(['User', 'Manager', 'Site Admin']);
    expect(accountRoles(users, 'plant-curitiba')).toEqual(['User', 'Manager']);
    expect(names(accountPeople(users, 'plant-lyon', 'Manager'))).toEqual(['Carla Mendes', 'Diego Laurent', 'Lucas Weber']);
    expect(names(accountPeople(users, 'plant-porto', 'Manager'))).toEqual(['Diego Laurent', 'Lucas Weber']);
  });

  it('asks the pillar, the level, then the person', () => {
    const pillars = reference.filter((item) => item.list === 'pillar');
    expect(rolePillars(users, pillars)).toHaveLength(4);
    expect(roleLevels(users, 'pillar-hs')).toEqual(['central', 'cluster', 'local']);
    expect(roleLevels(users, 'pillar-ir')).toEqual(['central', 'local']);
    expect(names(rolePeople(users, 'pillar-hs', 'cluster'))).toEqual(['Lucas Weber', 'Pascal Fischer']);
    expect(names(rolePeople(users, 'pillar-hs', 'local'))).toEqual(['Carla Mendes', 'Eva Novak', 'Felix Tanaka']);
    expect(names(rolePeople(users, 'pillar-env', 'central'))).toEqual(['Ed Petrov']);
  });
});
