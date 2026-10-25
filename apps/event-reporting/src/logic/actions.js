// Actions created from the whys of the root cause analysis (feature 004, remarks of 2026-10-25),
// with the core fields of the Action Plan source's corrective action. They belong to the event
// (event.actions) so the Actions step can extend them later.

import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';

export const ACTION_PRIORITIES = ['Emergency', 'High', 'Medium', 'Low'];
export const MAX_ASSIGNEES = 5;

export function emptyAction(whyId) {
  return { id: crypto.randomUUID(), whyId, description: '', assigneeIds: [], dueDate: '', priority: '' };
}

// Who can be assigned: users of the event's plant who can see its pillar.
export function actionCandidates(event, users) {
  return users.filter((person) => getPillarIdsForPlant(person, event.plantId).includes(event.pillarId));
}

// What is missing, as { field: message }.
export function validateAction(action) {
  const errors = {};
  if (!action.description.trim()) errors.description = 'Describe the action.';
  if (action.assigneeIds.length < 1 || action.assigneeIds.length > MAX_ASSIGNEES) {
    errors.assigneeIds = `Choose 1 to ${MAX_ASSIGNEES} assignees.`;
  }
  if (!action.dueDate) errors.dueDate = 'Choose a due date.';
  if (!ACTION_PRIORITIES.includes(action.priority)) errors.priority = 'Choose a priority.';
  return errors;
}

// The actions of a why and of the whys below it, e.g. before removing it.
export function actionsOfWhys(actions, whyIds) {
  return actions.filter((action) => whyIds.includes(action.whyId));
}
