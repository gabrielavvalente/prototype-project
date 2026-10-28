import { describe, expect, it } from 'vitest';
import { users } from '../../../../shared/platform/sampleData.js';
import { completeValidation, isLocked, rework, validateRework, validateValidation, validatorIds } from './planValidation.js';
import { currentStep } from './review.js';

const NOW = '2026-10-26T10:00:00.000Z';

function phases(required) {
  return Object.fromEntries(
    ['submission', 'review', 'rootCause', 'actions', 'validation'].map((phase) => [
      phase,
      { required: phase === 'submission' || required.includes(phase), sources: [] },
    ]),
  );
}

// TF-26-0005 like: Review, Actions and Validation, reviewed by Carla, plan completed.
function atValidation(changes = {}) {
  return {
    id: 'e1',
    status: 'In Progress',
    plantId: 'plant-lyon',
    pillarId: 'pillar-hs',
    reporterId: 'user-carla',
    workflow: { phases: phases(['review', 'actions', 'validation']) },
    review: { decision: 'valid', reviewerId: 'user-carla' },
    actions: [{ id: 'a1', status: 'completed' }],
    actionPlan: { deployedAt: NOW, completedAt: NOW, completedBy: 'user-ana' },
    ...changes,
  };
}

describe('validation (005)', () => {
  it('is done by the reviewer, or the Managers without review', () => {
    expect(validatorIds(atValidation(), users)).toEqual(['user-carla']);
    const noReview = atValidation({ workflow: { phases: phases(['actions', 'validation']) }, review: null });
    expect(validatorIds(noReview, users)).toEqual(['user-carla', 'user-diego', 'user-lucas']);
  });

  it('needs an answer, and a reason when not effective', () => {
    expect(Object.keys(validateValidation({ effective: null, reason: '' }))).toEqual(['effective']);
    expect(validateValidation({ effective: false, reason: ' ' })).toEqual({ reason: 'Explain why it is not effective.' });
    expect(validateValidation({ effective: true, reason: '' })).toEqual({ noMoreActions: 'Confirm that no additional actions are needed.' });
    expect(validateValidation({ effective: true, reason: '', noMoreActions: true })).toEqual({});
  });

  it('locks an event closed by an effective validation; rework reopens it at Actions (011)', () => {
    const { event: closed } = completeValidation(atValidation(), { effective: true, reason: '' }, 'user-carla', NOW, ['user-carla']);
    expect(isLocked(closed)).toBe(true);
    expect(isLocked({ ...closed, validations: [] })).toBe(false);
    expect(validateRework('  ')).toBe('Explain why it needs rework.');
    const { event: reworked, alerts } = rework(closed, ' Guard rail still loose ', 'user-carla', NOW, ['user-carla', 'user-diego']);
    expect(reworked).toMatchObject({ status: 'In Progress', closedAt: null, actionPlan: { completedAt: null } });
    expect(reworked.validations.at(-1)).toMatchObject({ effective: false, rework: true, reason: 'Guard rail still loose' });
    expect(isLocked(reworked)).toBe(false);
    expect(currentStep(reworked)).toBe('actions');
    expect(alerts.map((alert) => [alert.recipientId, alert.type, alert.work])).toEqual([['user-diego', 'Event sent back for rework', true]]);
  });

  it('closes the event when effective and tells the reporter', () => {
    const { event, alerts } = completeValidation(atValidation(), { effective: true, reason: 'ignored' }, 'user-carla', NOW, ['user-carla']);
    expect(event).toMatchObject({ status: 'Closed', closedAt: NOW, validations: [{ effective: true, reason: '', by: 'user-carla', at: NOW }] });
    expect(alerts.map((alert) => [alert.recipientId, alert.type])).toEqual([[event.reporterId, 'Event closed']]);
    expect(currentStep(event)).toBeNull();
  });

  it('sends the plan back to Actions when not effective and tells the owners and the reporter', () => {
    const { event, alerts } = completeValidation(atValidation(), { effective: false, reason: ' Still unfixed ' }, 'user-carla', NOW, ['user-diego']);
    expect(event.status).toBe('In Progress');
    expect(event.actionPlan.completedAt).toBeNull();
    expect(event.validations[0]).toMatchObject({ effective: false, reason: 'Still unfixed' });
    expect(currentStep(event)).toBe('actions');
    expect(alerts.map((alert) => [alert.recipientId, alert.type, alert.work])).toEqual([
      ['user-diego', 'Action plan not effective', true],
      [event.reporterId, 'Action plan not effective', false],
    ]);
  });
});
