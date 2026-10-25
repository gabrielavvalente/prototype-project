// Review of a submitted event and the steps of its workflow (review 2026-10-25; core lifecycle,
// Review and Governance source). The reviewers are the ones the Control Panel configured, kept on
// the event at submission (002 FR-010, FR-012).

import { assessmentFor, criticalFlagsOf, typedFlag } from './severity.js';

export const STEPS = ['submission', 'review', 'rootCause', 'actions', 'validation'];

export const STEP_LABELS = {
  submission: 'Submission',
  review: 'Review',
  rootCause: 'Root cause analysis',
  actions: 'Actions',
  validation: 'Validation',
};

export const INVALID_REASONS = ['Duplicated', 'Useless', 'Bad quality'];

// The reason that needs a comment (second review 2026-10-25).
export const REASON_NEEDING_COMMENT = 'Bad quality';

const ACTIVE_STATUSES = ['Open', 'In Progress'];

export function isReviewer(user, event) {
  return Boolean(event.workflow?.phases.review?.reviewerIds?.includes(user.id));
}

// Root cause analysis is also required when the reviewer asked for it ("further analyze" = Yes).
function isRequired(event, step) {
  if (step === 'submission') return true;
  if (step === 'rootCause' && event.review?.furtherAnalysis === true) return true;
  return Boolean(event.workflow?.phases[step]?.required);
}

// Review is done once decided; Root cause analysis once completed (feature 004).
function isDone(event, step) {
  if (step === 'review') return Boolean(event.review?.decision);
  if (step === 'rootCause') return Boolean(event.rca?.completedAt);
  return false;
}

// The step the event is waiting for, or null when its workflow is over (Draft, Archived, Closed).
export function currentStep(event) {
  if (!ACTIVE_STATUSES.includes(event.status)) {
    return null;
  }
  return STEPS.slice(1).find((step) => isRequired(event, step) && !isDone(event, step)) ?? null;
}

// One state per step for the steps menu: 'done' and 'current' can be opened; 'upcoming' (not
// reached yet) and 'skipped' (not required) cannot. An Archived event never reached the steps
// after Review.
export function stepStates(event) {
  const current = currentStep(event);
  const lastReached = event.status === 'Archived' ? STEPS.indexOf('review') + 1 : STEPS.length;
  const currentIndex = current ? STEPS.indexOf(current) : lastReached;
  return STEPS.map((step, index) => {
    let state = 'upcoming';
    if (!isRequired(event, step)) state = 'skipped';
    else if (step === current) state = 'current';
    else if (index < currentIndex || isDone(event, step)) state = 'done';
    return { step, state };
  });
}

// "Do you want to further analyze?" is asked only when the workflow does not already require
// Root cause analysis.
export function asksFurtherAnalysis(event) {
  return !event.workflow?.phases.rootCause?.required;
}

// Whether a valid review sends the event to Root cause analysis: required by the workflow, or
// asked for with "further analyze" = Yes.
export function leadsToAnalysis(event, review) {
  return !asksFurtherAnalysis(event) || review.furtherAnalysis === true;
}

// The Review button: a configured reviewer, an event waiting for review, not taken by someone else.
export function canStartReview(user, event) {
  return (
    isReviewer(user, event) &&
    currentStep(event) === 'review' &&
    (!event.review?.reviewerId || event.review.reviewerId === user.id)
  );
}

// "Assign myself": the event becomes In Progress and only this reviewer can review it.
export function claimReview(event, userId, now) {
  return { ...event, status: 'In Progress', review: { reviewerId: userId, claimedAt: now, decision: null } };
}

function validateStatement(statement, reporterName) {
  const text = (statement || '').trim();
  if (!text) return 'Write the event statement.';
  // The statement is shared further, so it must not name the reporter (Review and Governance FR-3).
  if (reporterName && text.toLowerCase().includes(reporterName.toLowerCase())) {
    return 'Do not name the reporter in the event statement.';
  }
  return null;
}

// Lists, severity, SIP answer, type and "further analyze" of a valid event (spec FR-022 to FR-028).
function validateAssessment(review, event, errors) {
  const assessment = assessmentFor(event);
  for (const listId of assessment.requiredListIds) {
    if (!(review.classification?.[listId] || []).length) errors[`list-${listId}`] = 'Choose at least one value.';
  }
  if (assessment.potential && !review.potential) errors.potential = `Rate the ${assessment.potentialTitle.toLowerCase()}.`;
  if (assessment.actual && !review.actual) errors.actual = `Rate the ${assessment.actualTitle.toLowerCase()}.`;
  if (assessment.sipQuestion && typeof review.sipConfirmed !== 'boolean') errors.sipConfirmed = 'Say whether the event is a SIP.';
  const flag = typedFlag(event);
  if (flag && criticalFlagsOf(event, review).includes(flag) && !review.criticalTypeId) {
    errors.criticalTypeId = `Choose the ${flag} type.`;
  }
  if (asksFurtherAnalysis(event) && typeof review.furtherAnalysis !== 'boolean') {
    errors.furtherAnalysis = 'Say whether the event should be analyzed further.';
  }
  const assignees = review.rcaAssignees;
  if (leadsToAnalysis(event, review) && !(assignees?.userIds.length || assignees?.groupIds.length)) {
    errors.rcaAssignees = 'Choose who will perform the root cause analysis.';
  }
}

// review = { decision, invalidReason, invalidComment, statement, classification, potential,
// actual, sipConfirmed, criticalTypeId, furtherAnalysis, rcaAssignees: { userIds, groupIds } } —
// potential / actual are rated cells.
export function validateReview(review, event, reporterName) {
  const errors = {};
  if (review.decision !== 'valid' && review.decision !== 'invalid') {
    errors.decision = 'Say whether the event is valid.';
  }
  if (review.decision === 'invalid') {
    if (!INVALID_REASONS.includes(review.invalidReason)) {
      errors.invalidReason = 'Choose why the event is not valid.';
    } else if (review.invalidReason === REASON_NEEDING_COMMENT && !(review.invalidComment || '').trim()) {
      errors.invalidComment = 'Explain what makes the report of bad quality.';
    }
  }
  if (review.decision === 'valid') {
    const statementError = validateStatement(review.statement, reporterName);
    if (statementError) errors.statement = statementError;
    validateAssessment(review, event, errors);
  }
  return errors;
}

// Only the fields of the decision taken are kept: a reviewer may answer No, then Yes (or the
// reverse), or change a matrix after choosing a type.
function decidedFields(event, review) {
  if (review.decision === 'invalid') {
    const comment = review.invalidReason === REASON_NEEDING_COMMENT ? review.invalidComment : '';
    return { decision: 'invalid', invalidReason: review.invalidReason, invalidComment: comment };
  }
  const assessment = assessmentFor(event);
  const criticalFlags = criticalFlagsOf(event, review);
  return {
    decision: 'valid',
    statement: review.statement,
    classification: review.classification || {},
    potential: assessment.potential ? review.potential : null,
    actual: assessment.actual ? review.actual : null,
    sipConfirmed: assessment.sipQuestion ? review.sipConfirmed : null,
    criticalFlags,
    criticalTypeId: criticalFlags.includes(typedFlag(event)) ? review.criticalTypeId : '',
    furtherAnalysis: asksFurtherAnalysis(event) ? review.furtherAnalysis : null,
    rcaAssignees: leadsToAnalysis(event, review) ? review.rcaAssignees : null,
  };
}

// Saves the decision: an invalid event is Archived; a valid one goes on to Root cause analysis
// (required or asked for), the next required step, or is Closed when nothing else is required.
export function completeReview(event, review, now) {
  const { reviewerId, claimedAt } = event.review || {};
  const reviewed = { ...event, review: { reviewerId, claimedAt, ...decidedFields(event, review), reviewedAt: now } };
  if (review.decision === 'invalid') {
    return { ...reviewed, status: 'Archived', archivedAt: now };
  }
  const next = currentStep({ ...reviewed, status: 'In Progress' });
  return next ? { ...reviewed, status: 'In Progress' } : { ...reviewed, status: 'Closed', closedAt: now };
}
