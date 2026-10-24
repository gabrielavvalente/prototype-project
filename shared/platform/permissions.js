// Control Panel roles: who acts at which level, for which plants (spec FR-001 to FR-003, FR-027).
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

export const LEVEL_ORDER = { central: 3, cluster: 2, local: 1 };

export const LEVEL_LABELS = { central: 'Central', cluster: 'Cluster', local: 'Local' };

// The user's Control Panel role on a pillar, or null.
export function getRole(user, pillarId) {
  return user.controlPanelRoles.find((role) => role.pillarId === pillarId) || null;
}

export function hasControlPanelAccess(user) {
  return user.controlPanelRoles.length > 0;
}

// Plants the role acts for: every plant for Central, the role's plants otherwise.
export function coveredPlantIds(role, organization) {
  if (role.level === 'central') {
    return organization.filter((node) => node.type === 'plant').map((node) => node.id);
  }
  return role.plantIds;
}

export function plantsOverlap(plantIdsA, plantIdsB) {
  return plantIdsA.some((plantId) => plantIdsB.includes(plantId));
}

// Option A (FR-009): a workflow setting is changed only by people at the same level, covering
// one of the setting's plants.
export function canEditSetting(user, setting) {
  const role = getRole(user, setting.pillarId);
  if (!role || role.level !== setting.scopeLevel) {
    return false;
  }
  return role.level === 'central' || plantsOverlap(role.plantIds, setting.plantIds);
}

// Every plant a user is linked to, for events or through a Control Panel role.
function linkedPlantIds(user) {
  const eventPlants = user.access.map((entry) => entry.plantId);
  const rolePlants = user.controlPanelRoles.flatMap((role) => role.plantIds);
  return [...new Set([...eventPlants, ...rolePlants])];
}

// Central (on any pillar) sees every user; others see users linked to one of their plants.
export function canSeeUser(viewer, user) {
  if (viewer.controlPanelRoles.some((role) => role.level === 'central')) {
    return true;
  }
  const viewerPlants = viewer.controlPanelRoles.flatMap((role) => role.plantIds);
  return plantsOverlap(viewerPlants, linkedPlantIds(user));
}
