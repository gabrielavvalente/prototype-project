// Short texts about users, plants, pillars and roles shared by the screens.

import { getPlantName } from '../../../../shared/platform/organization.js';
import { LEVEL_LABELS } from '../../../../shared/platform/permissions.js';

export function getPillars(reference) {
  return reference.filter((item) => item.list === 'pillar').sort((a, b) => a.sortOrder - b.sortOrder);
}

export function pillarLabel(reference, pillarId) {
  return reference.find((item) => item.id === pillarId)?.label ?? pillarId;
}

// Short pillar code for badges ("H&S", "ENV"…).
export function pillarCode(reference, pillarId) {
  return reference.find((item) => item.id === pillarId)?.code ?? pillarId;
}

export function describePlants(plantIds, organization, level) {
  if (level === 'central') {
    return 'All plants';
  }
  return plantIds.map((plantId) => getPlantName(organization, plantId)).join(', ');
}

// "H&S · Cluster" for a Control Panel role badge.
export function roleBadge(role, reference) {
  return `${pillarCode(reference, role.pillarId)} · ${LEVEL_LABELS[role.level]}`;
}

export function eventPlantIds(user) {
  return user.access.map((entry) => entry.plantId);
}

// Every pillar a user can report or see events for, in any plant.
export function eventPillarIds(user) {
  return [...new Set(user.access.flatMap((entry) => entry.pillarIds))];
}
