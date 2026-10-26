// The actions of an event's action plan (feature 005), created in the root cause analysis from a
// why or in the Actions step. They belong to the event (event.actions).

import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';

export const ACTION_PRIORITIES = ['Emergency', 'High', 'Medium', 'Low'];
export const MAX_ASSIGNEES = 5;

export const ACTION_STATUS_LABELS = {
  planned: 'Planned',
  onGoing: 'On Going',
  toComplete: 'To Complete',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const FINAL_STATUSES = ['completed', 'cancelled'];

function eventLocation(event) {
  return { departmentId: event?.location?.departmentId ?? '', workshopId: event?.location?.workshopId ?? '' };
}

// A new action, Planned, at the event's department and workshop (AP-4).
export function emptyAction(whyId, event) {
  return {
    id: crypto.randomUUID(),
    whyId: whyId ?? null,
    description: '',
    assigneeIds: [],
    dueDate: '',
    priority: '',
    location: eventLocation(event),
    notifyMaintenance: null,
    status: 'planned',
    dueDateHistory: [],
  };
}

// Actions saved before feature 005 had no status, location or Notify maintenance (research R2).
export function normalizeAction(action, event) {
  return {
    whyId: null,
    location: eventLocation(event),
    notifyMaintenance: null,
    status: 'planned',
    dueDateHistory: [],
    ...action,
  };
}

// Who can be assigned: users of the event's plant who can see its pillar.
export function actionCandidates(event, users) {
  return users.filter((person) => getPillarIdsForPlant(person, event.plantId).includes(event.pillarId));
}

// What is missing, as { field: message } (AP-4).
export function validateAction(action) {
  const errors = {};
  if (!action.description.trim()) errors.description = 'Describe the action.';
  if (action.assigneeIds.length < 1 || action.assigneeIds.length > MAX_ASSIGNEES) {
    errors.assigneeIds = `Choose 1 to ${MAX_ASSIGNEES} assignees.`;
  }
  if (!action.dueDate) errors.dueDate = 'Choose a due date.';
  if (!ACTION_PRIORITIES.includes(action.priority)) errors.priority = 'Choose a priority.';
  if (!action.location?.departmentId || !action.location?.workshopId) {
    errors.location = 'Choose the department and workshop.';
  }
  if (typeof action.notifyMaintenance !== 'boolean') {
    errors.notifyMaintenance = 'Say whether maintenance must be notified.';
  }
  return errors;
}

export function isDeployed(action) {
  return action.status !== 'planned';
}

export function isFinal(action) {
  return FINAL_STATUSES.includes(action.status);
}

// today: 'YYYY-MM-DD' (local date). Deployed, not finished, and due before today (AP-5).
export function isOverdue(action, today) {
  return isDeployed(action) && !isFinal(action) && Boolean(action.dueDate) && action.dueDate < today;
}

// A new due date, keeping the previous one in the history (AP-8).
export function changeDueDate(action, dueDate, userId, now) {
  if (!action.dueDate || action.dueDate === dueDate) return { ...action, dueDate };
  const entry = { from: action.dueDate, to: dueDate, by: userId, at: now };
  return { ...action, dueDate, dueDateHistory: [entry, ...(action.dueDateHistory ?? [])] };
}

// The actions of a why and of the whys below it, e.g. before removing it.
export function actionsOfWhys(actions, whyIds) {
  return actions.filter((action) => whyIds.includes(action.whyId));
}

// Today as 'YYYY-MM-DD' in local time.
export function localToday(now = new Date()) {
  const pad = (number) => String(number).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
