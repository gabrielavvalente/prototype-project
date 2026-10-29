// The action plan of an event (feature 005): who owns it, deploying it, the assignees' updates,
// cancelling and completing it. The actions themselves are in actions.js.

import { getManagersToAlert, isPlantSiteAdmin } from './access.js';
import { changeDueDate, isDeployed, isFinal, isOverdue } from './actions.js';
import { currentStep, stepStates } from './review.js';
import { planCompletedCandidates, planDeployedCandidates } from './notifications.js';
import { designatedIds } from './rootCause.js';
import { validatorIds } from './planValidation.js';

const isReviewRequired = (event) => Boolean(event.workflow?.phases.review?.required);

// The people designated for the analysis; else the reviewer (once someone took the review); with
// no review in the workflow, the Managers who can see the event (AP-2).
export function planOwners(event, groups, users) {
  const designated = designatedIds(event, groups);
  if (designated.length > 0) return designated;
  if (isReviewRequired(event)) return event.review?.reviewerId ? [event.review.reviewerId] : [];
  return getManagersToAlert(users, event).map((user) => user.id);
}

// The Actions step can be worked on while it is the current step, or an Optional step (AP-3) — not
// while the analysis is in progress, since the analysis saves the actions it lists.
function stepIsOpen(event) {
  if (event.actionPlan?.completedAt) return false;
  const step = currentStep(event);
  if (step === 'actions') return true;
  if (step === 'rootCause') return false;
  return stepStates(event).find((item) => item.step === 'actions').state === 'optional';
}

// The owners, and the plant's Site Admins (014 AP-2).
export function canEditPlan(user, event, groups, users) {
  return stepIsOpen(event) && (planOwners(event, groups, users).includes(user.id) || isPlantSiteAdmin(user, event));
}

// Whether the user may open the Actions step when it is Optional (AP-3).
export function canOpenOptionalPlan(user, event, groups, users) {
  return planOwners(event, groups, users).includes(user.id) || isPlantSiteAdmin(user, event);
}

const withStatus = (action, status, userId, now) => ({ ...action, status, statusChangedBy: userId, statusChangedAt: now });

// Deploy action plan: every Planned action becomes On Going, also when there is none (the immediate
// actions are then the plan); the plan may complete at once (AP-9, AP-12). No alert about single
// actions: the action management tool notifies them (007). Returns { event, alerts } (candidates).
export function deployPlan(event, userId, now, users) {
  const actions = (event.actions ?? []).map((action) => (action.status === 'planned' ? withStatus(action, 'onGoing', userId, now) : action));
  const actionPlan = { ...event.actionPlan, deployedBy: userId, deployedAt: now, completedBy: null, completedAt: null };
  const finished = finishIfDone({ ...event, actions, actionPlan }, userId, now, users);
  return { event: finished.event, alerts: [...planDeployedCandidates(finished.event), ...finished.alerts] };
}

// A new action: On Going at once when the plan is deployed (AP-9).
export function addAction(event, action, userId, now) {
  const deployed = Boolean(event.actionPlan?.deployedAt);
  const added = { ...action, createdBy: userId, createdAt: now, ...(deployed ? { status: 'onGoing', statusChangedBy: userId, statusChangedAt: now } : {}) };
  return { ...event, actions: [...(event.actions ?? []), added] };
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
// actsForAssignees: a Site Admin of the plant changes any action as its assignee would (014 AP-10).
export function allowedStatuses(user, action, isOwner, actsForAssignees = false) {
  if (!isDeployed(action) || isFinal(action)) return [];
  const next = [];
  if (action.assigneeIds.includes(user.id) || actsForAssignees) {
    if (action.status === 'onGoing') next.push('toComplete');
    next.push('completed');
  }
  if (isOwner) next.push('cancelled');
  return next;
}

// A status change; finishing the last action completes the plan (AP-10, AP-12).
// Returns { event, alerts }.
export function setActionStatus(event, actionId, status, userId, now, users) {
  const changed = { ...event, actions: event.actions.map((action) => (action.id === actionId ? withStatus(action, status, userId, now) : action)) };
  return finishIfDone(changed, userId, now, users);
}

// { count, completed, overdue, deployed } for the plan header, immediate actions included (AP-11).
export function planSummary(event, today) {
  const actions = event.actions ?? [];
  const immediate = event.immediateActions?.length ?? 0;
  return {
    count: immediate + actions.length,
    completed: immediate + actions.filter((action) => action.status === 'completed').length,
    overdue: actions.filter((action) => isOverdue(action, today)).length,
    deployed: Boolean(event.actionPlan?.deployedAt),
  };
}

// Deployed, every corrective action Completed or Cancelled, and at least one action Completed —
// the immediate actions count, being always Completed (AP-12).
export function isPlanFinished(event) {
  const actions = event.actions ?? [];
  const anyCompleted = (event.immediateActions?.length ?? 0) > 0 || actions.some((action) => action.status === 'completed');
  return Boolean(event.actionPlan?.deployedAt) && actions.every(isFinal) && anyCompleted;
}

// Completes a finished plan by itself: the event moves to its next required step (In Progress) or
// closes (AP-12). Returns { event, alerts } (candidates of NT-3).
export function finishIfDone(event, userId, now, users) {
  if (event.actionPlan?.completedAt || !isPlanFinished(event)) return { event, alerts: [] };
  const done = { ...event, actionPlan: { ...event.actionPlan, completedBy: userId, completedAt: now } };
  const next = currentStep({ ...done, status: 'In Progress' });
  const finished = next ? { ...done, status: 'In Progress' } : { ...done, status: 'Closed', closedAt: now };
  const validators = next === 'validation' ? validatorIds(done, users) : [];
  return { event: finished, alerts: planCompletedCandidates(finished, validators) };
}
