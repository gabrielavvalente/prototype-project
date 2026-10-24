// Status of an event right after submission (002 spec FR-026): Closed when its workflow requires
// nothing besides Submission, otherwise Open.

import { isOnlySubmission } from '../../../../shared/platform/workflow.js';

export function getSubmittedStatus(workflow) {
  return isOnlySubmission(workflow) ? 'Closed' : 'Open';
}
