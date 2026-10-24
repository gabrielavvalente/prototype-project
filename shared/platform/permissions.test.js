import { describe, expect, it } from 'vitest';
import { canSeeUser, coveredPlantIds, getRole, hasControlPanelAccess } from './permissions.js';
import { organization, users } from './sampleData.js';

const byId = (id) => users.find((user) => user.id === id);

describe('Control Panel roles', () => {
  it('finds the role of a pillar and nothing on another pillar (FR-003)', () => {
    const felix = byId('user-felix');
    expect(getRole(felix, 'pillar-hs').level).toBe('local');
    expect(getRole(felix, 'pillar-ir')).toBeNull();
  });

  it('gives Central every plant and others their own plants', () => {
    const ludovic = byId('user-ludovic');
    const lucas = byId('user-lucas');
    expect(coveredPlantIds(getRole(ludovic, 'pillar-hs'), organization)).toEqual([
      'plant-lyon',
      'plant-curitiba',
      'plant-porto',
    ]);
    expect(coveredPlantIds(getRole(lucas, 'pillar-hs'), organization)).toEqual(['plant-lyon', 'plant-porto']);
  });

  it('opens the Control Panel only to people holding a role (FR-002)', () => {
    expect(hasControlPanelAccess(byId('user-ana'))).toBe(false);
    expect(hasControlPanelAccess(byId('user-eva'))).toBe(true);
  });
});

describe('canSeeUser (FR-027)', () => {
  it('lets Central see everyone', () => {
    expect(users.every((user) => canSeeUser(byId('user-ed'), user))).toBe(true);
  });

  it('limits a Cluster to users of its plants', () => {
    const lucas = byId('user-lucas');
    expect(canSeeUser(lucas, byId('user-ana'))).toBe(true);
    expect(canSeeUser(lucas, byId('user-gina'))).toBe(true);
    expect(canSeeUser(lucas, byId('user-ben'))).toBe(false);
  });
});
