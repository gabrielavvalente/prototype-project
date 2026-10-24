// Role and scope rules, kept in one place so every screen applies them the same way
// (research R11, contracts/routes.md).

const menuByRole = {
  User: ['events', 'create-event', 'my-alerts'],
  Manager: ['events', 'create-event', 'my-alerts'],
  'Site Admin': ['events'],
};

const routesByRole = {
  User: ['entry', 'events', 'search', 'events-new', 'event-detail', 'event-edit'],
  Manager: ['entry', 'events', 'search', 'events-new', 'event-detail', 'event-edit'],
  'Site Admin': ['entry', 'events', 'search', 'event-detail'],
};

export function getMenuItems(role) {
  return menuByRole[role] || [];
}

export function canOpenRoute(role, routeName) {
  return (routesByRole[role] || []).includes(routeName);
}

// The pillars a user may access in one plant (empty when the plant is not theirs).
export function getPillarIdsForPlant(user, plantId) {
  const entry = user.access.find((item) => item.plantId === plantId);
  return entry ? entry.pillarIds : [];
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
  return user.role === 'Manager' && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId);
}

// Managers who receive the "Event submitted" alert for this event.
export function getManagersToAlert(users, event) {
  return users.filter(
    (user) =>
      user.role === 'Manager' && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId),
  );
}
