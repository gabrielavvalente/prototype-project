// The demo sign-in as a sequence of choices (012 PD-7): Event Reporting asks the plant, the event
// role, then the person; the Control Panel and User Management ask the pillar, the level, then the
// person. Each step offers only what leads to someone.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import { getPlants } from './organization.js';
import { LEVEL_ORDER } from './permissions.js';

export const EVENT_ROLES = ['User', 'Manager', 'Site Admin'];

const atPlant = (user, plantId) => user.access.some((entry) => entry.plantId === plantId);

// Event Reporting: plants with at least one person holding an event role, by name.
export function accountPlants(users, organization) {
  return getPlants(organization)
    .filter((plant) => users.some((user) => user.role && atPlant(user, plant.id)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function accountRoles(users, plantId) {
  return EVENT_ROLES.filter((role) => users.some((user) => user.role === role && atPlant(user, plantId)));
}

export function accountPeople(users, plantId, role) {
  return users.filter((user) => user.role === role && atPlant(user, plantId));
}

const roleOn = (user, pillarId) => user.controlPanelRoles.find((role) => role.pillarId === pillarId);

// Control Panel and User Management: pillars (reference order) someone has a role on.
export function rolePillars(users, pillars) {
  return pillars.filter((pillar) => users.some((user) => roleOn(user, pillar.id)));
}

// The levels held on a pillar, highest first.
export function roleLevels(users, pillarId) {
  return Object.keys(LEVEL_ORDER)
    .sort((a, b) => LEVEL_ORDER[b] - LEVEL_ORDER[a])
    .filter((level) => users.some((user) => roleOn(user, pillarId)?.level === level));
}

export function rolePeople(users, pillarId, level) {
  return users.filter((user) => roleOn(user, pillarId)?.level === level);
}
