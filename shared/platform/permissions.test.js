import { describe, expect, it } from 'vitest';
import { canSeeUser, coveredPlantIds, getRole, hasControlPanelAccess, withSiteAdminRoles } from './permissions.js';
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

describe('withSiteAdminRoles (review 2026-10-25)', () => {
  it('gives a Site Admin a Local role on each pillar of their plant', () => {
    const roles = byId('user-eva').controlPanelRoles;
    expect(roles).toHaveLength(4);
    expect(roles.every((role) => role.level === 'local' && role.plantIds[0] === 'plant-lyon')).toBe(true);
  });

  it('keeps a role the user already holds on a pillar', () => {
    const admin = {
      role: 'Site Admin',
      access: [{ plantId: 'plant-porto', pillarIds: ['pillar-hs', 'pillar-env'] }],
      controlPanelRoles: [{ pillarId: 'pillar-hs', level: 'cluster', plantIds: ['plant-lyon', 'plant-porto'] }],
    };
    const roles = withSiteAdminRoles(admin).controlPanelRoles;
    expect(roles.map((role) => role.level)).toEqual(['cluster', 'local']);
  });

  it('gives nothing to other event roles', () => {
    expect(byId('user-carla').controlPanelRoles).toHaveLength(1);
  });
});
