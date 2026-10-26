// The action plan of an event (feature 005): who owns it, deploying it, the assignees' updates,
// cancelling and completing it. The actions themselves are in actions.js.

import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { getManagersToAlert } from './access.js';
import { changeDueDate, isDeployed, isFinal, isOverdue } from './actions.js';
import { currentStep, stepStates } from './review.js';
import { designatedIds } from './rootCause.js';

const isReviewRequired = (event) => Boolean(event.workflow?.phases.review?.required);

// The people designated for the analysis; else the reviewer (once someone took the review); with
// no review in the workflow, the Managers who can see the event (AP-2).
export function planOwners(event, groups, users) {
  const designated = designatedIds(event, groups);
  if (designated.length > 0) return designated;
  if (isReviewRequired(event)) return event.review?.reviewerId ? [event.review.reviewerId] : [];
  return getManagersToAlert(users, event).map((user) => user.id);
}

// The Actions step can be worked on while it is the current step, or an Optional step (AP-3).
function stepIsOpen(event) {
  if (event.actionPlan?.completedAt) return false;
  if (currentStep(event) === 'actions') return true;
  return stepStates(event).find((item) => item.step === 'actions').state === 'optional';
}

export function canEditPlan(user, event, groups, users) {
  return stepIsOpen(event) && planOwners(event, groups, users).includes(user.id);
}

// Whether the user may open the Actions step when it is Optional (AP-3).
export function canOpenOptionalPlan(user, event, groups, users) {
  return planOwners(event, groups, users).includes(user.id);
}

function canSeeEvent(users, event, id) {
  const person = users.find((user) => user.id === id);
  return Boolean(person) && getPillarIdsForPlant(person, event.plantId).includes(event.pillarId);
}

// Each assignee once, if they can see the event (AP-9).
function recipientsOf(actions, event, users) {
  const ids = [...new Set(actions.flatMap((action) => action.assigneeIds))];
  return ids.filter((id) => canSeeEvent(users, event, id));
}

const withStatus = (action, status, userId, now) => ({ ...action, status, statusChangedBy: userId, statusChangedAt: now });

// Deploy action plan: every Planned action becomes On Going. Returns { event, recipientIds }.
export function deployPlan(event, userId, now, users) {
  const planned = event.actions.filter((action) => action.status === 'planned');
  const actions = event.actions.map((action) => (action.status === 'planned' ? withStatus(action, 'onGoing', userId, now) : action));
  const actionPlan = { ...event.actionPlan, deployedBy: userId, deployedAt: now, completedBy: null, completedAt: null };
  return { event: { ...event, actions, actionPlan }, recipientIds: recipientsOf(planned, event, users) };
}

// A new action: On Going and alerting its assignees once the plan is deployed (AP-9).
export function addAction(event, action, userId, now, users) {
  const deployed = Boolean(event.actionPlan?.deployedAt);
  const added = { ...action, createdBy: userId, createdAt: now, ...(deployed ? { status: 'onGoing', statusChangedBy: userId, statusChangedAt: now } : {}) };
  const updated = { ...event, actions: [...(event.actions ?? []), added] };
  return { event: updated, recipientIds: deployed ? recipientsOf([added], event, users) : [] };
}

// An edited action; a new due date goes to the history (AP-8).
export function updateAction(event, changed, userId, now) {
  const actions = event.actions.map((action) => {
    if (action.id !== changed.id) return action;
    const dated = changeDueDate(action, changed.dueDate, userId, now);
    return { ...changed, dueDateHistory: dated.dueDateHistory };
  });
  return { ...event, actions };
}

// Only Planned actions are deleted; deployed ones are cancelled (AP-7).
export function deleteAction(event, actionId) {
  return { ...event, actions: event.actions.filter((action) => action.id !== actionId || action.status !== 'planned') };
}

// The statuses the user may give an action (AP-7, AP-10): the assignee moves their own action
// forward; an owner cancels a deployed one. Completed and Cancelled are final.
export function allowedStatuses(user, action, isOwner) {
  if (!isDeployed(action) || isFinal(action)) return [];
  const next = [];
  if (action.assigneeIds.includes(user.id)) {
    if (action.status === 'onGoing') next.push('toComplete');
    next.push('completed');
  }
  if (isOwner) next.push('cancelled');
  return next;
}

export function setActionStatus(event, actionId, status, userId, now) {
  return { ...event, actions: event.actions.map((action) => (action.id === actionId ? withStatus(action, status, userId, now) : action)) };
}

// { count, completed, overdue, deployed } for the plan header (AP-11).
export function planSummary(event, today) {
  const actions = event.actions ?? [];
  return {
    count: actions.length,
    completed: actions.filter((action) => action.status === 'completed').length,
    overdue: actions.filter((action) => isOverdue(action, today)).length,
    deployed: Boolean(event.actionPlan?.deployedAt),
  };
}

// Why the plan cannot be completed yet, or null (AP-12).
export function completeBlocker(event) {
  const actions = event.actions ?? [];
  if (!event.actionPlan?.deployedAt) return 'Deploy the action plan first.';
  const done = actions.every(isFinal) && actions.some((action) => action.status === 'completed');
  return done ? null : 'Every action must be Completed or Cancelled, and at least one Completed.';
}

// Completing moves the event to its next required step (In Progress), or closes it (AP-12).
export function completePlan(event, userId, now) {
  const done = { ...event, actionPlan: { ...event.actionPlan, completedBy: userId, completedAt: now } };
  const next = currentStep({ ...done, status: 'In Progress' });
  return next ? { ...done, status: 'In Progress' } : { ...done, status: 'Closed', closedAt: now };
}
