import { describe, expect, it } from 'vitest';
import { workflowSettings, users } from '../../../../shared/platform/sampleData.js';
import { workflowForEvent } from '../../../../shared/platform/workflow.js';
import { completeImmediateActions, getSubmittedStatus } from './submission.js';

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

describe('completeImmediateActions (review 2026-10-25)', () => {
  it('gives each action the report date and the pillar of the event', () => {
    const event = { reportDate: '2026-10-20', pillarId: 'pillar-env', immediateActions: [{ id: 'a', description: 'Spill contained' }] };
    expect(completeImmediateActions(event)).toEqual([
      { id: 'a', description: 'Spill contained', completionDate: '2026-10-20', pillarId: 'pillar-env' },
    ]);
  });
});
