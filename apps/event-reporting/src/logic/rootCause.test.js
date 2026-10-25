import { describe, expect, it } from 'vitest';
import { investigationGroups, users } from '../../../../shared/platform/sampleData.js';
import {
  assigneeIds,
  canPerformAnalysis,
  completeAnalysis,
  emptyAnalysis,
  partStatus,
  validateAnalysis,
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
  analysis.causes = [{ id: 'c1', theme: 'Method', cause: 'No signage', why: 'Nobody saw the wet floor' }];
  analysis.legs[0].whys = [{ id: 'w1', answer: 'Cleaning contract misses the night shift', rootCause: 'conditional' }];
  analysis.learnings = 'Check the cleaning schedule against the shifts.';
  return analysis;
}

const byId = (id) => users.find((user) => user.id === id);

describe('root cause analysis (004)', () => {
  it('starts from the review statement and the immediate actions', () => {
    const analysis = emptyAnalysis(makeEvent(['review', 'rootCause'], null));
    expect(analysis.statement).toBe('An operator slipped');
    expect(analysis.immediateActions).toBe('Area cleaned\nSign placed');
    expect(analysis.legs).toHaveLength(1);
    expect(Object.values(partStatus(analysis))).toEqual(['notStarted', 'notStarted', 'notStarted', 'notStarted']);
  });

  it('needs 6M, a classified root cause and the learnings to complete; 5W1H is optional', () => {
    const analysis = completeAnalysisData();
    expect(validateAnalysis(analysis)).toEqual({});
    const unclassified = { ...analysis, legs: [{ id: 'l', whys: [{ id: 'w', answer: 'x', rootCause: 'unclassified' }] }] };
    expect(Object.keys(validateAnalysis(unclassified))).toEqual(['fiveWhy']);
    expect(Object.keys(validateAnalysis({ ...analysis, causes: [], learnings: ' ' }))).toEqual(['sixM', 'learnings']);
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
