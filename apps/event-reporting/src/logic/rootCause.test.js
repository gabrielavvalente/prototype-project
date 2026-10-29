import { describe, expect, it } from 'vitest';
import { investigationGroups, users } from '../../../../shared/platform/sampleData.js';
import { currentStep } from './review.js';
import {
  addWhyBelow,
  assigneeIds,
  branchWhy,
  canDoFiveWhy,
  canPerformAnalysis,
  completeAnalysis,
  emptyAnalysis,
  FIVE_W1H,
  fiveW1HSections,
  normalizeAnalysis,
  partStatus,
  removeWhy,
  SIX_M_THEMES,
  syncWhysWithCauses,
  validateAnalysis,
  whyDepth,
} from './rootCause.js';

const NOW = '2026-10-25T10:00:00.000Z';

function phases(required) {
  return Object.fromEntries(
    ['submission', 'review', 'rootCause', 'actions', 'validation'].map((phase) => [
      phase,
      { required: phase === 'submission' || required.includes(phase), sources: [] },
    ]),
  );
}

// A Lyon H&S event reviewed by Carla, at Root cause analysis.
function makeEvent(required, rcaAssignees, changes = {}) {
  return {
    id: 'e1',
    status: 'In Progress',
    plantId: 'plant-lyon',
    pillarId: 'pillar-hs',
    description: 'Worker slipped',
    immediateActions: [{ description: 'Area cleaned' }, { description: 'Sign placed' }],
    workflow: { phases: phases(required) },
    review: { decision: 'valid', reviewerId: 'user-carla', statement: 'An operator slipped', rcaAssignees },
    ...changes,
  };
}

function completeAnalysisData() {
  const analysis = emptyAnalysis(makeEvent(['review', 'rootCause'], null));
  analysis.causes = [{ id: 'c1', theme: 'management', option: 'Lack of Resources', other: '', why: 'Nobody was free to put the sign' }];
  analysis.whys = [{ id: 'w1', parentId: 'c1', answer: 'Cleaning contract misses the night shift', rootCause: true }];
  analysis.learnings = 'Check the cleaning schedule against the shifts.';
  return analysis;
}

const byId = (id) => users.find((user) => user.id === id);

describe('root cause analysis (004)', () => {
  it('starts from the review statement with no why until a 6M cause is ticked', () => {
    const analysis = emptyAnalysis(makeEvent(['review', 'rootCause'], null));
    expect(analysis.statement).toBe('An operator slipped');
    expect(analysis.whys).toHaveLength(0);
    expect(Object.values(partStatus(analysis))).toEqual(['notStarted', 'notStarted', 'notStarted', 'notStarted']);
  });

  it('needs 6M, a classified root cause and the learnings to complete; 5W1H is optional', () => {
    const analysis = completeAnalysisData();
    expect(validateAnalysis(analysis)).toEqual({});
    const noRootCause = { ...analysis, whys: [{ id: 'w', parentId: 'c1', answer: 'x', rootCause: false }] };
    expect(Object.keys(validateAnalysis(noRootCause))).toEqual(['fiveWhy']);
    const emptyRootCause = { ...analysis, whys: [...analysis.whys, { id: 'w2', parentId: 'c1', answer: ' ', rootCause: true }] };
    expect(Object.keys(validateAnalysis(emptyRootCause))).toEqual(['fiveWhy']);
    expect(Object.keys(validateAnalysis({ ...analysis, causes: [], learnings: ' ' }))).toEqual(['sixM', 'learnings']);
    const unnamedOther = { ...analysis, causes: [{ id: 'c2', theme: 'methods', option: 'Other', other: ' ', why: 'x' }] };
    expect(Object.keys(validateAnalysis(unnamedOther))).toEqual(['sixM']);
  });

  it('counts 5W1H as done when it does not apply, or applies with every question answered (014 RCA-10)', () => {
    const analysis = emptyAnalysis(makeEvent(['review', 'rootCause'], null));
    expect(partStatus(analysis, 'pillar-env').fiveW1H).toBe('notStarted');
    expect(partStatus({ ...analysis, fiveW1HApplies: false }, 'pillar-env').fiveW1H).toBe('done');
    const applies = { ...analysis, fiveW1HApplies: true };
    applies.fiveW1H.what = { applies: null, answers: { 'what-1': 'Slipped on a wet floor' } };
    expect(partStatus(applies, 'pillar-env').fiveW1H).toBe('inProgress');
    for (const section of fiveW1HSections('pillar-env')) {
      applies.fiveW1H[section.key].answers = Object.fromEntries(section.questions.map((question) => [question.id, 'Answered']));
    }
    expect(partStatus(applies, 'pillar-env').fiveW1H).toBe('done');
  });

  it('offers "Who was injured?" for Health & Safety events only (006)', () => {
    expect(fiveW1HSections('pillar-env').map((section) => section.key)).not.toContain('who');
    expect(fiveW1HSections('pillar-ir').map((section) => section.key)).not.toContain('who');
    expect(fiveW1HSections('pillar-ih').map((section) => section.key)).not.toContain('who');
    expect(fiveW1HSections('pillar-hs').map((section) => section.key)).toContain('who');
    const analysis = { ...emptyAnalysis(makeEvent(['review', 'rootCause'], null)), fiveW1HApplies: true };
    for (const section of fiveW1HSections('pillar-env')) {
      analysis.fiveW1H[section.key].answers = Object.fromEntries(section.questions.map((question) => [question.id, 'x']));
    }
    expect(partStatus(analysis, 'pillar-hs').fiveW1H).toBe('inProgress');
    expect(partStatus(analysis, 'pillar-env').fiveW1H).toBe('done');
  });

  it('branches any why into an alternative beside it and removes a why with the whys below', () => {
    let whys = [{ id: 'w1', parentId: 'c1' }, { id: 'w2', parentId: 'w1' }, { id: 'w3', parentId: 'w2' }];
    whys = branchWhy(whys, 'w2');
    expect(whys.map((why) => why.parentId)).toEqual(['c1', 'w1', 'w2', 'w1']);
    const alternative = whys[3];
    whys = addWhyBelow(whys, alternative.id);
    expect(whyDepth(whys, whys[4])).toBe(3);
    expect(removeWhy(whys, 'w2').map((why) => why.id)).toEqual(['w1', alternative.id, whys[4].id]);
    expect(removeWhy(whys, 'w1')).toBe(whys);
  });

  it('gives each 6M cause a first why and drops the whys of unticked causes', () => {
    const whys = syncWhysWithCauses([], [{ id: 'c1' }, { id: 'c2' }]);
    expect(whys.map((why) => why.parentId)).toEqual(['c1', 'c2']);
    const below = [...whys, { id: 'deep', parentId: whys[1].id }];
    expect(syncWhysWithCauses(below, [{ id: 'c1' }]).map((why) => why.id)).toEqual([whys[0].id]);
  });

  it('opens 5 Why once 6M is done', () => {
    const analysis = completeAnalysisData();
    expect(canDoFiveWhy(analysis)).toBe(true);
    expect(canDoFiveWhy({ ...analysis, causes: [...analysis.causes, { id: 'c2', theme: 'methods', option: 'Training', why: '' }] })).toBe(false);
  });

  it('converts an analysis saved before the remarks', () => {
    const old = {
      statement: 's',
      immediateActions: 'Area cleaned',
      fiveW1H: { who: { applies: true, answer: 'Diego' } },
      causes: [{ id: 'c1', theme: 'Method', cause: 'No signage', why: 'Nobody saw it' }],
      legs: [{ id: 'l1', whys: [{ id: 'a', answer: '1', rootCause: null }, { id: 'b', answer: '2', rootCause: 'conditional' }] }],
      learnings: '',
    };
    const analysis = normalizeAnalysis(old);
    expect(analysis.immediateActions).toBeUndefined();
    expect(analysis.whys.map((why) => why.parentId)).toEqual(['c1', 'a']);
    expect(analysis.whys.map((why) => why.rootCause)).toEqual([false, true]);
    expect(analysis.fiveW1H.who).toEqual({ applies: true, answers: { 'who-1': 'Diego' } });
    expect(analysis.fiveW1H.how).toEqual({ applies: null, answers: {} });
    // One section answered Yes before 014: the whole guide applies.
    expect(analysis.fiveW1HApplies).toBe(true);
    expect(analysis.causes[0]).toMatchObject({ theme: 'management', option: 'Other', other: 'No signage' });
  });

  it('moves the event to the next required step, or closes it', () => {
    const withActions = completeAnalysis(makeEvent(['review', 'rootCause', 'actions'], null), completeAnalysisData(), 'user-diego', NOW);
    expect(withActions.status).toBe('In Progress');
    expect(withActions.rca).toMatchObject({ completedBy: 'user-diego', completedAt: NOW });
    const nothingElse = completeAnalysis(makeEvent(['review', 'rootCause'], null), completeAnalysisData(), 'user-diego', NOW);
    expect(nothingElse.status).toBe('Closed');
  });

  it('goes to Actions instead of closing when the analysis created actions (005 RCA-16)', () => {
    const withPlan = makeEvent(['review', 'rootCause'], null, { actions: [{ id: 'a1', status: 'planned' }] });
    const completed = completeAnalysis(withPlan, completeAnalysisData(), 'user-diego', NOW);
    expect(completed.status).toBe('In Progress');
    expect(currentStep(completed)).toBe('actions');
  });

  it('lets only the designated people (users and group members) fill it in', () => {
    const event = makeEvent(['review', 'rootCause'], { userIds: ['user-diego'], groupIds: ['group-lyon-hs'] });
    expect(canPerformAnalysis(byId('user-diego'), event, investigationGroups)).toBe(true);
    expect(canPerformAnalysis(byId('user-ana'), event, investigationGroups)).toBe(true);
    expect(canPerformAnalysis(byId('user-lucas'), event, investigationGroups)).toBe(false);
    const completed = { ...event, rca: { completedAt: NOW } };
    expect(canPerformAnalysis(byId('user-diego'), completed, investigationGroups)).toBe(false);
  });

  it('lets the reviewer fill it in when nobody was designated', () => {
    const event = makeEvent(['review', 'rootCause'], null);
    expect(canPerformAnalysis(byId('user-carla'), event, investigationGroups)).toBe(true);
    expect(canPerformAnalysis(byId('user-diego'), event, investigationGroups)).toBe(false);
  });

  it('alerts each designated person who can see the event once, never the reviewer', () => {
    const event = makeEvent(['review', 'rootCause'], { userIds: ['user-diego', 'user-ana'], groupIds: ['group-lyon-hs'] });
    expect(assigneeIds(event, investigationGroups, users)).toEqual(['user-diego', 'user-ana', 'user-eva']);
  });

  it('holds the content of the support documents (006)', () => {
    const counts = Object.fromEntries(FIVE_W1H.map((section) => [section.key, section.questions.length]));
    expect(counts).toEqual({ who: 7, what: 13, when: 6, where: 4, why: 7, how: 7 });
    expect(SIX_M_THEMES.map((theme) => theme.label)).toEqual(['Management', 'Man Power', 'Methods', 'Machines/Tools/Equipment', 'Materials', 'Environment']);
    expect(SIX_M_THEMES.map((theme) => theme.causes.length)).toEqual([7, 13, 9, 9, 6, 10]);
  });
});
