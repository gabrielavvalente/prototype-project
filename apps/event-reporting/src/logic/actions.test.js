import { describe, expect, it } from 'vitest';
import { users } from '../../../../shared/platform/sampleData.js';
import { actionCandidates, actionsOfWhys, emptyAction, validateAction } from './actions.js';

describe('actions from whys (004)', () => {
  it('needs a description, 1 to 5 assignees, a due date and a priority', () => {
    const action = emptyAction('w1');
    expect(Object.keys(validateAction(action))).toEqual(['description', 'assigneeIds', 'dueDate', 'priority']);
    const complete = { ...action, description: 'Extend the cleaning contract', assigneeIds: ['user-diego'], dueDate: '2026-11-30', priority: 'High' };
    expect(validateAction(complete)).toEqual({});
    const tooMany = { ...complete, assigneeIds: ['a', 'b', 'c', 'd', 'e', 'f'] };
    expect(Object.keys(validateAction(tooMany))).toEqual(['assigneeIds']);
  });

  it('offers the users of the plant who can see the pillar', () => {
    const ids = actionCandidates({ plantId: 'plant-lyon', pillarId: 'pillar-hs' }, users).map((user) => user.id);
    expect(ids).toContain('user-diego');
    expect(ids).not.toContain('user-felix');
  });

  it('finds the actions of a set of whys', () => {
    const actions = [{ id: 'a1', whyId: 'w1' }, { id: 'a2', whyId: 'w2' }];
    expect(actionsOfWhys(actions, ['w2', 'w3'])).toEqual([{ id: 'a2', whyId: 'w2' }]);
  });
});
