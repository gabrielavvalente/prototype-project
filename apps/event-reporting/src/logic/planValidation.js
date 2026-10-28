// The Validation step (feature 005, review remarks of 2026-10-26): the reviewer checks that the
// action plan was effective, then closes the event or sends it back to Actions.

import { getManagersToAlert } from './access.js';
import { reworkCandidates, validationCandidates } from './notifications.js';

// The event's reviewer; with no review in its workflow, the Managers who can see it (VAL-1).
export function validatorIds(event, users) {
  if (event.workflow?.phases.review?.required) return event.review?.reviewerId ? [event.review.reviewerId] : [];
  return getManagersToAlert(users, event).map((user) => user.id);
}

// The last validation, or null.
export function lastValidation(event) {
  return event.validations?.at(-1) ?? null;
}

// answer = { effective: true | false | null, reason } — what is missing, as { field: message }.
export function validateValidation(answer) {
  const errors = {};
  if (typeof answer.effective !== 'boolean') errors.effective = 'Say whether the action plan is effective.';
  else if (!answer.effective && !answer.reason.trim()) errors.reason = 'Explain why it is not effective.';
  // Closing needs the confirmation that nothing more is needed (011 VAL-2).
  else if (answer.effective && !answer.noMoreActions) errors.noMoreActions = 'Confirm that no additional actions are needed.';
  return errors;
}

// Effective: Closed. Not effective: back to Actions, the plan opens again (VAL-3, VAL-4).
// Returns { event, alerts } (candidates of NT-3).
export function completeValidation(event, answer, userId, now, ownerIds) {
  const validation = { effective: answer.effective, reason: answer.effective ? '' : answer.reason.trim(), by: userId, at: now };
  const validations = [...(event.validations ?? []), validation];
  if (answer.effective) {
    const closed = { ...event, validations, status: 'Closed', closedAt: now };
    return { event: closed, alerts: validationCandidates(closed, ownerIds) };
  }
  const reopened = { ...event, validations, status: 'In Progress', actionPlan: { ...event.actionPlan, completedBy: null, completedAt: null } };
  return { event: reopened, alerts: validationCandidates(reopened, ownerIds) };
}

// Closed by an effective validation: nothing can change until a rework (011 VAL-6).
export function isLocked(event) {
  return event.status === 'Closed' && lastValidation(event)?.effective === true;
}

export function validateRework(reason) {
  return reason.trim() ? '' : 'Explain why it needs rework.';
}

// Rework: kept as a not-effective validation (rework: true), so the event goes back to Actions, the
// plan opens again and the event returns to Validation once it completes (011 VAL-7).
// Returns { event, alerts } (candidates: the plan owners but the validator).
export function rework(event, reason, userId, now, ownerIds) {
  const validation = { effective: false, rework: true, reason: reason.trim(), by: userId, at: now };
  const reopened = {
    ...event,
    validations: [...(event.validations ?? []), validation],
    status: 'In Progress',
    closedAt: null,
    actionPlan: { ...event.actionPlan, completedBy: null, completedAt: null },
  };
  return { event: reopened, alerts: reworkCandidates(ownerIds.filter((id) => id !== userId)) };
}
