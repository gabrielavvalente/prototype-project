import { describe, expect, it } from 'vitest';
import { canStartReview, claimReview, completeReview, currentStep, leadsToAnalysis, reviewLists, stepStates, summaryLists, validateReview } from './review.js';

const NOW = '2026-10-25T10:00:00.000Z';

function phases(required) {
  return Object.fromEntries(
    ['submission', 'review', 'rootCause', 'actions', 'validation'].map((phase) => [
      phase,
      { required: phase === 'submission' || required.includes(phase), sources: [] },
    ]),
  );
}

// critical: the phases the critical row requires, applied once the review flags the event (012).
function makeEvent(required, changes = {}, critical = []) {
  const workflow = { phases: phases(required), critical: phases(critical) };
  workflow.phases.review.reviewerIds = ['user-carla', 'user-eva'];
  return { id: 'e1', status: 'Open', workflow, review: null, ...changes };
}

// An Environment event and a review confirming it is a SIP: a critical (red) event.
function envEvent(required, critical = []) {
  return { ...makeEvent(required, {}, critical), familyCode: 'EVE', levelCode: 'EvE4' };
}

function criticalReview() {
  return { decision: 'valid', statement: 'x', flagConfirmed: true, criticalTypeId: 'sipTypeEnv-1', classification: { aspects: ['a1'], impacts: ['i1'] } };
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
    // After a valid review, an analysis nobody required stays possible: Optional (010 RCA-18).
    expect(stepStates(event).map((item) => item.state)).toEqual(['done', 'done', 'optional', 'current', 'skipped']);
    expect(stepStates(makeEvent(['review', 'validation'])).map((item) => item.state)).toEqual([
      'done',
      'current',
      'skipped',
      'optional',
      'upcoming',
    ]);
  });

  it('makes Actions optional while active, and required once the plan has an action (005)', () => {
    const closed = makeEvent(['review'], { status: 'Closed', review: { decision: 'valid' } });
    expect(stepStates(closed)[3].state).toBe('skipped');
    const withAction = makeEvent(['review'], { status: 'In Progress', review: { decision: 'valid' }, actions: [{ id: 'a1' }] });
    expect(currentStep(withAction)).toBe('actions');
    const completed = { ...withAction, actionPlan: { completedAt: NOW } };
    expect(currentStep(completed)).toBeNull();
    expect(stepStates(completed)[3].state).toBe('done');
    const duringReview = makeEvent(['review'], { status: 'In Progress', review: { reviewerId: 'user-carla', decision: null }, actions: [{ id: 'a1' }] });
    expect(stepStates(duringReview)[3].state).toBe('optional');
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
    const event = makeEvent(['review', 'rootCause']);
    expect(Object.keys(validateReview({}, event, 'Ana Ribeiro'))).toEqual(['decision']);
    expect(Object.keys(validateReview({ decision: 'invalid' }, event, 'Ana Ribeiro'))).toEqual(['invalidReason']);
    expect(validateReview({ decision: 'valid', statement: 'Ana Ribeiro slipped' }, event, 'Ana Ribeiro').statement).toMatch(/reporter/);
    const designated = { userIds: ['user-diego'], groupIds: [] };
    expect(validateReview({ decision: 'valid', statement: 'An operator slipped', rcaAssignees: designated }, event, 'Ana Ribeiro')).toEqual({});
  });

  it('needs a comment for Bad quality only (second review)', () => {
    const event = makeEvent(['review']);
    expect(Object.keys(validateReview({ decision: 'invalid', invalidReason: 'Bad quality' }, event, ''))).toEqual(['invalidComment']);
    expect(validateReview({ decision: 'invalid', invalidReason: 'Bad quality', invalidComment: 'No location' }, event, '')).toEqual({});
    expect(validateReview({ decision: 'invalid', invalidReason: 'Duplicated' }, event, '')).toEqual({});
  });

  it('asks the HCL or SPL answer of an industrial risk event, without a type (006 review remarks)', () => {
    const sre = (levelCode) => ({ ...makeEvent(['review']), familyCode: 'SRE', levelCode });
    const review = { decision: 'valid', statement: 'x', classification: { irCategories: ['c1'] } };
    expect(validateReview(review, sre('SRE3'), '')).toEqual({ flagConfirmed: 'Say whether the event is an HCL.' });
    expect(validateReview(review, sre('SRE4'), '')).toEqual({ flagConfirmed: 'Say whether the event is an SPL.' });
    expect(validateReview({ ...review, flagConfirmed: true }, sre('SRE4'), '')).toEqual({});
  });

  it('sends a critical event to the analysis only when its critical row requires it (012 RV-10)', () => {
    // Nobody is asked whether to analyse further.
    expect(validateReview(criticalReview(), envEvent(['review']), '')).toEqual({});
    expect(leadsToAnalysis(envEvent(['review']), criticalReview())).toBe(false);
    expect(leadsToAnalysis(envEvent(['review'], ['rootCause']), criticalReview())).toBe(true);
    // Not critical: the critical row does not apply.
    const calm = { ...criticalReview(), flagConfirmed: false };
    expect(validateReview(calm, envEvent(['review'], ['rootCause']), '')).toEqual({});
    expect(leadsToAnalysis(envEvent(['review'], ['rootCause']), calm)).toBe(false);
    const designated = { userIds: [], groupIds: ['group-lyon-hs'] };
    expect(validateReview({ decision: 'valid', statement: 'x', rcaAssignees: designated }, makeEvent(['review', 'rootCause']), '')).toEqual({});
  });

  it('requires who performs the analysis whenever it will happen (004)', () => {
    const empty = { userIds: [], groupIds: [] };
    const required = validateReview({ decision: 'valid', statement: 'x', rcaAssignees: empty }, makeEvent(['review', 'rootCause']), '');
    expect(Object.keys(required)).toEqual(['rcaAssignees']);
    const critical = validateReview(criticalReview(), envEvent(['review'], ['rootCause']), '');
    expect(Object.keys(critical)).toEqual(['rcaAssignees']);
    expect(validateReview(criticalReview(), envEvent(['review']), '')).toEqual({});
  });

  it('asks only the lists the level requires (012 remarks)', () => {
    const ids = (event) => reviewLists(event).map((list) => list.id);
    const tf = (levelCode) => ({ pillarId: 'pillar-hs', familyCode: 'TF', levelCode });
    for (const level of ['TF1', 'TF2', 'TF3']) expect(ids(tf(level))).toEqual(['standards', 'hazards', 'bodyParts', 'injuries']);
    for (const level of ['TF4', 'TF5']) expect(ids(tf(level))).toEqual(['standards', 'hazards']);
    expect(ids({ pillarId: 'pillar-ir', familyCode: 'SRE', levelCode: 'SRE4' })).toEqual(['irCategories']);
    // An earlier answer on a list no longer asked still shows in the summary.
    const listed = summaryLists(tf('TF4'), { bodyParts: ['bodyParts-2'] }).map((list) => list.id);
    expect(listed).toEqual(['standards', 'hazards', 'bodyParts']);
  });

  it('asks a single Standard and Hazard (005 remarks)', () => {
    const tf = { ...makeEvent(['review']), familyCode: 'TF', levelCode: 'TF4' };
    const errors = validateReview({ decision: 'valid', statement: 'x', classification: {} }, tf, '');
    expect(errors['list-standards']).toBe('Choose a value.');
    expect(errors['list-hazards']).toBe('Choose a value.');
  });

  it('keeps the designation only when the analysis will happen (004)', () => {
    const designated = { userIds: ['user-diego'], groupIds: [] };
    const kept = completeReview(makeEvent(['review', 'rootCause']), { decision: 'valid', statement: 'x', rcaAssignees: designated }, NOW);
    expect(kept.review.rcaAssignees).toEqual(designated);
    const dropped = completeReview(makeEvent(['review']), { decision: 'valid', statement: 'x', rcaAssignees: designated }, NOW);
    expect(dropped.review.rcaAssignees).toBeNull();
  });

  it('moves past Root cause analysis once it is completed (004)', () => {
    const analyzing = makeEvent(['review', 'rootCause', 'actions'], { status: 'In Progress', review: { decision: 'valid' } });
    expect(currentStep(analyzing)).toBe('rootCause');
    const completed = { ...analyzing, rca: { completedAt: NOW } };
    expect(currentStep(completed)).toBe('actions');
    expect(stepStates(completed).map((item) => item.state)).toEqual(['done', 'done', 'done', 'current', 'skipped']);
  });

  it('archives an invalid event', () => {
    const done = completeReview(claimReview(makeEvent(['review']), carla.id, NOW), { decision: 'invalid', invalidReason: 'Duplicated' }, NOW);
    expect(done.status).toBe('Archived');
    expect(done.review).toMatchObject({ reviewerId: 'user-carla', invalidReason: 'Duplicated', reviewedAt: NOW });
  });

  it('keeps only the fields of the decision taken', () => {
    const changedMind = { decision: 'valid', invalidReason: 'Useless', invalidComment: 'x', statement: 'An operator slipped', classification: { standards: ['s1'] }, furtherAnalysis: false };
    const valid = completeReview(makeEvent(['review']), changedMind, NOW).review;
    expect(valid).toMatchObject({ statement: 'An operator slipped', classification: { standards: ['s1'] } });
    expect(valid.invalidReason).toBeUndefined();
    const invalid = completeReview(makeEvent(['review']), { ...changedMind, decision: 'invalid' }, NOW).review;
    expect(invalid).toEqual({ reviewerId: undefined, claimedAt: undefined, decision: 'invalid', invalidReason: 'Useless', invalidComment: '', reviewedAt: NOW });
  });

  it('adds the phases of the critical row once the review flags the event (012 WF-13)', () => {
    const designated = { userIds: ['user-diego'], groupIds: [] };
    const event = envEvent(['review', 'actions'], ['rootCause', 'validation']);
    const analyzed = completeReview(event, { ...criticalReview(), rcaAssignees: designated }, NOW);
    expect(analyzed.status).toBe('In Progress');
    expect(analyzed.review.furtherAnalysis).toBeUndefined();
    expect(currentStep(analyzed)).toBe('rootCause');
    expect(stepStates(analyzed).map((item) => item.state)).toEqual(['done', 'done', 'current', 'upcoming', 'upcoming']);
    const calm = completeReview(event, { ...criticalReview(), flagConfirmed: false }, NOW);
    expect(currentStep(calm)).toBe('actions');
    expect(stepStates(calm)[4].state).toBe('skipped');
    // Reviewed before 012 with "further analyze" = Yes: still analysed.
    const earlier = { ...makeEvent(['review']), status: 'In Progress', review: { decision: 'valid', furtherAnalysis: true } };
    expect(currentStep(earlier)).toBe('rootCause');
  });

  it('keeps the steps after Review disabled for an Archived event', () => {
    const archived = completeReview(makeEvent(['review', 'actions']), { decision: 'invalid', invalidReason: 'Duplicated' }, NOW);
    expect(stepStates(archived).map((item) => item.state)).toEqual(['done', 'done', 'skipped', 'upcoming', 'skipped']);
  });

  it('keeps the critical classification and the SIP type of a safety review', () => {
    const tf2 = makeEvent(['review', 'rootCause'], { familyCode: 'TF', levelCode: 'TF2' });
    const review = {
      decision: 'valid',
      statement: 'x',
      potential: { impact: 'severe', duration: 'medium', score: 50, band: 'high' },
      actual: { impact: 'minor', duration: 'short', score: 5, band: 'low' },
      criticalTypeId: 'sipTypeHs-1',
    };
    expect(completeReview(tf2, review, NOW).review).toMatchObject({ criticalFlags: ['SIP'], criticalTypeId: 'sipTypeHs-1' });
    const lowPotential = { ...review, potential: { ...review.potential, band: 'medium', score: 30 } };
    expect(completeReview(tf2, lowPotential, NOW).review).toMatchObject({ criticalFlags: [], criticalTypeId: '' });
  });

  it('closes a valid event when nothing else is required, otherwise keeps it In Progress', () => {
    const onlyReview = completeReview(claimReview(makeEvent(['review']), carla.id, NOW), { decision: 'valid' }, NOW);
    expect(onlyReview.status).toBe('Closed');
    const withActions = completeReview(claimReview(makeEvent(['review', 'actions']), carla.id, NOW), { decision: 'valid' }, NOW);
    expect(withActions.status).toBe('In Progress');
  });

  it('goes to Actions instead of closing when the plan already has actions (005)', () => {
    const prepared = claimReview(makeEvent(['review'], { actions: [{ id: 'a1' }] }), carla.id, NOW);
    const reviewed = completeReview(prepared, { decision: 'valid' }, NOW);
    expect(reviewed.status).toBe('In Progress');
    expect(currentStep(reviewed)).toBe('actions');
  });
});
