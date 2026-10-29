// Role and scope rules, kept in one place so every screen applies them the same way
// (research R11, contracts/routes.md).

import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';

// Shared platform code; re-exported so screens keep one import.
export { getPillarIdsForPlant };

// Every event role reports; Site Admins too (014 ER-1).
const menuByRole = {
  User: ['events', 'create-event', 'my-alerts'],
  Manager: ['events', 'create-event', 'my-alerts'],
  'Site Admin': ['events', 'create-event', 'my-alerts'],
};

const allRoutes = ['entry', 'events', 'search', 'events-new', 'event-detail', 'event-edit', 'event-steps', 'notifications', 'communication'];
const routesByRole = { User: allRoutes, Manager: allRoutes, 'Site Admin': allRoutes };

export function getMenuItems(role) {
  return menuByRole[role] || [];
}

export function canOpenRoute(role, routeName) {
  return (routesByRole[role] || []).includes(routeName);
}

// A Site Admin of the event's plant: the highest access on its events, every pillar — never on a
// locked event (014, requirements RP-8a).
export function isPlantSiteAdmin(user, event) {
  return user?.role === 'Site Admin' && (user.access || []).some((entry) => entry.plantId === event.plantId);
}

// Closed by its validation (011 VAL-6); kept here so access rules need no other module.
const isLockedEvent = (event) => event.status === 'Closed' && event.validations?.at(-1)?.effective === true;

// context = { businessId, plantId, pillarId } where pillarId is null for "All pillars".
export function isEventVisible(user, context, event) {
  if (event.businessId !== context.businessId || event.plantId !== context.plantId) {
    return false;
  }
  if (!isPlantSiteAdmin(user, event) && !getPillarIdsForPlant(user, event.plantId).includes(event.pillarId)) {
    return false;
  }
  if (context.pillarId && event.pillarId !== context.pillarId) {
    return false;
  }
  // Drafts belong to the person who created them.
  if (event.status === 'Draft' && event.createdBy !== user.id) {
    return false;
  }
  return true;
}

// A draft by its author; an Open event by the Managers and Site Admins who see it; once reviewed,
// only by a Site Admin of its plant, never when locked (014 ER-21).
export function canEditEvent(user, event) {
  if (event.status === 'Draft') {
    return event.createdBy === user.id;
  }
  if (isPlantSiteAdmin(user, event)) {
    return !isLockedEvent(event);
  }
  return event.status === 'Open' && user.role === 'Manager' && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId);
}

// Users who can be chosen in "Shared with": people of the event's plant who can see its pillar.
export function getShareableUsers(users, event) {
  return users.filter((user) => getPillarIdsForPlant(user, event.plantId).includes(event.pillarId));
}

// Managers who see the event (also the validators and plan owners of an event without review).
// Site Admins of the event's plant and the Managers who see it: they receive "Event submitted"
// (014 NT-3).
export function getSubmissionWatchers(users, event) {
  return users.filter((user) => isPlantSiteAdmin(user, event) || (user.role === 'Manager' && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId)));
}

export function getManagersToAlert(users, event) {
  return users.filter(
    (user) =>
      user.role === 'Manager' && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId),
  );
}
