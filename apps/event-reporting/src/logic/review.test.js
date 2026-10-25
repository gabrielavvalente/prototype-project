import { describe, expect, it } from 'vitest';
import { canStartReview, claimReview, completeReview, currentStep, stepStates, validateReview } from './review.js';

const NOW = '2026-10-25T10:00:00.000Z';

function phases(required) {
  return Object.fromEntries(
    ['submission', 'review', 'rootCause', 'actions', 'validation'].map((phase) => [
      phase,
      { required: phase === 'submission' || required.includes(phase), sources: [] },
    ]),
  );
}

function makeEvent(required, changes = {}) {
  const workflow = { phases: phases(required) };
  workflow.phases.review.reviewerIds = ['user-carla', 'user-eva'];
  return { id: 'e1', status: 'Open', workflow, review: null, ...changes };
}

const carla = { id: 'user-carla' };
const eva = { id: 'user-eva' };
const ana = { id: 'user-ana' };

describe('steps of an event', () => {
  it('waits for the review, then the next required step', () => {
    expect(currentStep(makeEvent(['review', 'actions']))).toBe('review');
    const reviewed = makeEvent(['review', 'actions'], { status: 'In Progress', review: { decision: 'valid' } });
    expect(currentStep(reviewed)).toBe('actions');
  });

  it('shows done, current, upcoming and skipped steps', () => {
    const event = makeEvent(['review', 'actions'], { status: 'In Progress', review: { decision: 'valid' } });
    expect(stepStates(event).map((item) => item.state)).toEqual(['done', 'done', 'skipped', 'current', 'skipped']);
    expect(stepStates(makeEvent(['review', 'validation'])).map((item) => item.state)).toEqual([
      'done',
      'current',
      'skipped',
      'skipped',
      'upcoming',
    ]);
  });

  it('has no current step once Archived or Closed', () => {
    expect(currentStep(makeEvent(['review'], { status: 'Archived' }))).toBeNull();
    expect(currentStep(makeEvent(['review', 'actions'], { status: 'Closed' }))).toBeNull();
  });
});

describe('review', () => {
  it('offers the review to configured reviewers only, until someone takes it', () => {
    const event = makeEvent(['review']);
    expect(canStartReview(carla, event)).toBe(true);
    expect(canStartReview(ana, event)).toBe(false);
    const claimed = claimReview(event, carla.id, NOW);
    expect(claimed.status).toBe('In Progress');
    expect(canStartReview(carla, claimed)).toBe(true);
    expect(canStartReview(eva, claimed)).toBe(false);
  });

  it('needs a reason for an invalid event and a statement without the reporter name', () => {
    expect(Object.keys(validateReview({}, 'Ana Ribeiro'))).toEqual(['decision']);
    expect(Object.keys(validateReview({ decision: 'invalid' }, 'Ana Ribeiro'))).toEqual(['invalidReason']);
    expect(validateReview({ decision: 'valid', statement: 'Ana Ribeiro slipped' }, 'Ana Ribeiro').statement).toMatch(/reporter/);
    expect(validateReview({ decision: 'valid', statement: 'An operator slipped' }, 'Ana Ribeiro')).toEqual({});
  });

  it('archives an invalid event', () => {
    const done = completeReview(claimReview(makeEvent(['review']), carla.id, NOW), { decision: 'invalid', invalidReason: 'Duplicated' }, NOW);
    expect(done.status).toBe('Archived');
    expect(done.review).toMatchObject({ reviewerId: 'user-carla', invalidReason: 'Duplicated', reviewedAt: NOW });
  });

  it('keeps only the fields of the decision taken', () => {
    const changedMind = { decision: 'valid', invalidReason: 'Useless', statement: 'An operator slipped', classification: { standards: ['s1'] } };
    const valid = completeReview(makeEvent(['review']), changedMind, NOW).review;
    expect(valid).toMatchObject({ invalidReason: '', statement: 'An operator slipped', classification: { standards: ['s1'] } });
    const invalid = completeReview(makeEvent(['review']), { ...changedMind, decision: 'invalid' }, NOW).review;
    expect(invalid).toMatchObject({ invalidReason: 'Useless', statement: '', classification: {} });
  });

  it('closes a valid event when nothing else is required, otherwise keeps it In Progress', () => {
    const onlyReview = completeReview(claimReview(makeEvent(['review']), carla.id, NOW), { decision: 'valid' }, NOW);
    expect(onlyReview.status).toBe('Closed');
    const withActions = completeReview(claimReview(makeEvent(['review', 'actions']), carla.id, NOW), { decision: 'valid' }, NOW);
    expect(withActions.status).toBe('In Progress');
  });
});
