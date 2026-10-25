// Role and scope rules, kept in one place so every screen applies them the same way
// (research R11, contracts/routes.md).

import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';

// Shared platform code; re-exported so screens keep one import.
export { getPillarIdsForPlant };

const menuByRole = {
  User: ['events', 'create-event', 'my-alerts'],
  Manager: ['events', 'create-event', 'my-alerts'],
  'Site Admin': ['events'],
};

const routesByRole = {
  User: ['entry', 'events', 'search', 'events-new', 'event-detail', 'event-edit', 'event-steps'],
  Manager: ['entry', 'events', 'search', 'events-new', 'event-detail', 'event-edit', 'event-steps'],
  'Site Admin': ['entry', 'events', 'search', 'event-detail', 'event-steps'],
};

export function getMenuItems(role) {
  return menuByRole[role] || [];
}

export function canOpenRoute(role, routeName) {
  return (routesByRole[role] || []).includes(routeName);
}

// context = { businessId, plantId, pillarId } where pillarId is null for "All pillars".
export function isEventVisible(user, context, event) {
  if (event.businessId !== context.businessId || event.plantId !== context.plantId) {
    return false;
  }
  if (!getPillarIdsForPlant(user, event.plantId).includes(event.pillarId)) {
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

export function canEditEvent(user, event) {
  if (user.role === 'Site Admin') {
    return false;
  }
  if (event.status === 'Draft') {
    return event.createdBy === user.id;
  }
  // Once reviewed (In Progress, Archived, Closed) the submission is no longer changed; the reviewer
  // corrects it in the review (review 2026-10-25).
  if (event.status !== 'Open') {
    return false;
  }
  return user.role === 'Manager' && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId);
}

// Users who can be chosen in "Shared with": people of the event's plant who can see its pillar.
export function getShareableUsers(users, event) {
  return users.filter((user) => getPillarIdsForPlant(user, event.plantId).includes(event.pillarId));
}

// Managers who receive the "Event submitted" alert for this event.
export function getManagersToAlert(users, event) {
  return users.filter(
    (user) =>
      user.role === 'Manager' && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId),
  );
}
