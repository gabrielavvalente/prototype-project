import { describe, expect, it } from 'vitest';
import { groupsCovering, groupsVisibleTo, membersOf } from './groups.js';
import { investigationGroups, users } from './sampleData.js';

const byId = (id) => users.find((user) => user.id === id);
const ids = (groups) => groups.map((group) => group.id);

describe('investigation groups (004)', () => {
  it('offers the groups covering the plant and the pillar', () => {
    expect(ids(groupsCovering(investigationGroups, { plantId: 'plant-lyon', pillarId: 'pillar-hs' }))).toEqual([
      'group-lyon-hs',
      'group-electrical',
    ]);
    expect(ids(groupsCovering(investigationGroups, { plantId: 'plant-porto', pillarId: 'pillar-env' }))).toEqual([
      'group-porto-env',
    ]);
  });

  it('shows Central every group and others the groups of their plants', () => {
    expect(groupsVisibleTo(byId('user-ludovic'), investigationGroups)).toHaveLength(4);
    expect(ids(groupsVisibleTo(byId('user-lucas'), investigationGroups))).toEqual([
      'group-lyon-hs',
      'group-electrical',
      'group-porto-env',
    ]);
  });

  it('lists each member of the chosen groups once', () => {
    expect(membersOf(investigationGroups, ['group-electrical', 'group-porto-env'])).toEqual([
      'user-diego',
      'user-lucas',
      'user-gina',
    ]);
  });
});
