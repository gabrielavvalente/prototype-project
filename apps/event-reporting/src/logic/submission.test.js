import { describe, expect, it } from 'vitest';
import { workflowSettings, users } from '../../../../shared/platform/sampleData.js';
import { workflowForEvent } from '../../../../shared/platform/workflow.js';
import { getSubmittedStatus } from './submission.js';

function statusOf(levelCode, plantId) {
  const event = { pillarId: 'pillar-hs', levelCode, plantId };
  return getSubmittedStatus(workflowForEvent(workflowSettings, users, event));
}

describe('getSubmittedStatus (FR-026)', () => {
  it('keeps an event Open when a phase after Submission is required', () => {
    expect(statusOf('TF1', 'plant-curitiba')).toBe('Open');
  });

  it('closes an event when only Submission is required', () => {
    expect(statusOf('TF5', 'plant-lyon')).toBe('Closed');
  });
});
