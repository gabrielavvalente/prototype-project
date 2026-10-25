// Short texts describing a Control Panel role, used in cards, the context bar and lists.

import { getPlantName } from '../../../../shared/platform/organization.js';
import { LEVEL_LABELS } from '../../../../shared/platform/permissions.js';

export function describePlants(role, organization) {
  if (role.level === 'central') {
    return 'All plants';
  }
  return role.plantIds.map((plantId) => getPlantName(organization, plantId)).join(', ');
}

export function describeRole(role, organization) {
  return `${LEVEL_LABELS[role.level]} · ${describePlants(role, organization)}`;
}

// CSS modifier of the pillar color dot in shared/theme.css (e.g. "pillar-hs" → "hs").
export function pillarDotClass(pillarId) {
  return `pillar-dot pillar-dot--${pillarId.replace('pillar-', '')}`;
}

export function getPillars(reference) {
  return reference.filter((item) => item.list === 'pillar').sort((a, b) => a.sortOrder - b.sortOrder);
}
