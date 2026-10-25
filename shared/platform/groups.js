// Investigation groups (feature 004): which groups an event can be assigned to, which groups a
// viewer may see, and the people behind a designation.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

// The groups covering the event's plant and pillar.
export function groupsCovering(groups, { plantId, pillarId }) {
  return groups.filter((group) => group.plantIds.includes(plantId) && group.pillarIds.includes(pillarId));
}

// Central (on any pillar) sees every group; others see the groups sharing a plant with their roles,
// as for the users (002 FR-027).
export function groupsVisibleTo(viewer, groups) {
  if (viewer.controlPanelRoles.some((role) => role.level === 'central')) {
    return groups;
  }
  const viewerPlants = viewer.controlPanelRoles.flatMap((role) => role.plantIds);
  return groups.filter((group) => group.plantIds.some((plantId) => viewerPlants.includes(plantId)));
}

// The members of the chosen groups, each once.
export function membersOf(groups, groupIds) {
  const ids = groups.filter((group) => groupIds.includes(group.id)).flatMap((group) => group.memberIds);
  return [...new Set(ids)];
}
