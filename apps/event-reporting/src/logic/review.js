// Review of a submitted event and the steps of its workflow (review 2026-10-25; core lifecycle,
// Review and Governance source). The reviewers are the ones the Control Panel configured, kept on
// the event at submission (002 FR-010, FR-012).

export const STEPS = ['submission', 'review', 'rootCause', 'actions', 'validation'];

export const STEP_LABELS = {
  submission: 'Submission',
  review: 'Review',
  rootCause: 'Root cause analysis',
  actions: 'Actions',
  validation: 'Validation',
};

export const INVALID_REASONS = ['Duplicated', 'Useless', 'Bad quality'];

const ACTIVE_STATUSES = ['Open', 'In Progress'];

export function isReviewer(user, event) {
  return Boolean(event.workflow?.phases.review?.reviewerIds?.includes(user.id));
}

function isRequired(event, step) {
  return step === 'submission' || Boolean(event.workflow?.phases[step]?.required);
}

// The step the event is waiting for, or null when its workflow is over (Draft, Archived, Closed).
export function currentStep(event) {
  if (!ACTIVE_STATUSES.includes(event.status)) {
    return null;
  }
  const reviewDone = Boolean(event.review?.decision);
  return STEPS.slice(1).find((step) => isRequired(event, step) && !(step === 'review' && reviewDone)) ?? null;
}

// One state per step for the steps menu: 'done' and 'current' can be opened; 'upcoming' (not
// reached yet) and 'skipped' (not required) cannot.
export function stepStates(event) {
  const current = currentStep(event);
  const currentIndex = current ? STEPS.indexOf(current) : STEPS.length;
  return STEPS.map((step, index) => {
    let state = 'upcoming';
    if (!isRequired(event, step)) state = 'skipped';
    else if (step === current) state = 'current';
    else if (index < currentIndex || (step === 'review' && event.review?.decision)) state = 'done';
    return { step, state };
  });
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

// review = { decision: 'valid' | 'invalid', invalidReason, statement, classification }
export function validateReview(review, reporterName) {
  const errors = {};
  if (review.decision !== 'valid' && review.decision !== 'invalid') {
    errors.decision = 'Say whether the event is valid.';
  }
  if (review.decision === 'invalid' && !INVALID_REASONS.includes(review.invalidReason)) {
    errors.invalidReason = 'Choose why the event is not valid.';
  }
  if (review.decision === 'valid') {
    const statement = (review.statement || '').trim();
    if (!statement) {
      errors.statement = 'Write the event statement.';
    } else if (reporterName && statement.toLowerCase().includes(reporterName.toLowerCase())) {
      // The statement is shared further, so it must not name the reporter (Review and Governance FR-3).
      errors.statement = 'Do not name the reporter in the event statement.';
    }
  }
  return errors;
}

// Saves the decision: an invalid event is Archived; a valid one goes on to the next required step,
// or is Closed when nothing else is required.
export function completeReview(event, review, now) {
  // Only the fields of the decision taken: a reviewer may answer No, then Yes (or the reverse).
  const decided =
    review.decision === 'invalid'
      ? { decision: 'invalid', invalidReason: review.invalidReason, statement: '', classification: {} }
      : { decision: 'valid', invalidReason: '', statement: review.statement, classification: review.classification || {} };
  const reviewed = { ...event, review: { ...event.review, ...decided, comments: review.comments || '', reviewedAt: now } };
  if (review.decision === 'invalid') {
    return { ...reviewed, status: 'Archived', archivedAt: now };
  }
  const next = currentStep({ ...reviewed, status: 'In Progress' });
  return next ? { ...reviewed, status: 'In Progress' } : { ...reviewed, status: 'Closed', closedAt: now };
}
