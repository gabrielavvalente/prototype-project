// Small helpers shared by the workflow views.

import { getPlantName } from '../../../../shared/platform/organization.js';
import { LEVEL_LABELS } from '../../../../shared/platform/permissions.js';

// The levels (rows) of a pillar: TF1…TF5, EvE1…, SRE1…, or the Industrial Hygiene disease types.
export function getPillarLevels(reference, pillarId) {
  const family = reference.find((item) => item.list === 'family' && item.pillarId === pillarId);
  return reference
    .filter((item) => item.list === 'level' && item.familyId === family.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function userName(users, userId) {
  return users.find((user) => user.id === userId)?.name ?? 'Unknown user';
}

// "Central", "Cluster Lyon, Porto" or "Local Lyon".
export function describeScope(setting, organization) {
  if (setting.scopeLevel === 'central') {
    return LEVEL_LABELS.central;
  }
  const plants = setting.plantIds.map((plantId) => getPlantName(organization, plantId)).join(', ');
  return `${LEVEL_LABELS[setting.scopeLevel]} ${plants}`;
}
