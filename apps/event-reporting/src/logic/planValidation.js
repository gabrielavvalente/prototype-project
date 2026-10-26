// The Validation step (feature 005, review remarks of 2026-10-26): the reviewer checks that the
// action plan was effective, then closes the event or sends it back to Actions.

import { getManagersToAlert } from './access.js';
import { validationCandidates } from './notifications.js';

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
