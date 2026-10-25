import { describe, expect, it } from 'vitest';
import { investigationGroups, users } from '../../../../shared/platform/sampleData.js';
import {
  addWhyBelow,
  assigneeIds,
  branchWhy,
  canDoFiveWhy,
  canPerformAnalysis,
  completeAnalysis,
  emptyAnalysis,
  FIVE_W1H,
  normalizeAnalysis,
  partStatus,
  removeWhy,
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

  it('counts 5W1H as done when every section is No, or Yes with every answer', () => {
    const analysis = emptyAnalysis(makeEvent(['review', 'rootCause'], null));
    for (const section of FIVE_W1H) analysis.fiveW1H[section.key].applies = false;
    analysis.fiveW1H.what = { applies: true, answers: { 'what-1': 'Slipped on a wet floor' } };
    expect(partStatus(analysis).fiveW1H).toBe('inProgress');
    analysis.fiveW1H.what.answers = Object.fromEntries(FIVE_W1H[1].questions.map((question) => [question.id, 'Answered']));
    expect(partStatus(analysis).fiveW1H).toBe('done');
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
    expect(analysis.causes[0]).toMatchObject({ theme: 'management', option: 'Other', other: 'No signage' });
  });

  it('moves the event to the next required step, or closes it', () => {
    const withActions = completeAnalysis(makeEvent(['review', 'rootCause', 'actions'], null), completeAnalysisData(), 'user-diego', NOW);
    expect(withActions.status).toBe('In Progress');
    expect(withActions.rca).toMatchObject({ completedBy: 'user-diego', completedAt: NOW });
    const nothingElse = completeAnalysis(makeEvent(['review', 'rootCause'], null), completeAnalysisData(), 'user-diego', NOW);
    expect(nothingElse.status).toBe('Closed');
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
});
