// Status of an event right after submission (002 spec FR-026): Closed when its workflow requires
// nothing besides Submission, otherwise Open.

import { isOnlySubmission } from '../../../../shared/platform/workflow.js';

export function getSubmittedStatus(workflow) {
  return isOnlySubmission(workflow) ? 'Closed' : 'Open';
}

// Immediate actions are done at the scene: they take the event's report date as completion date
// and the event's pillar as category (review 2026-10-25).
export function completeImmediateActions(event) {
  return event.immediateActions.map((action) => ({
    ...action,
    completionDate: event.reportDate,
    pillarId: event.pillarId,
  }));
}
