import { describe, expect, it } from 'vitest';
import { users } from '../../../../shared/platform/sampleData.js';
import {
  actionCandidates,
  actionsOfWhys,
  changeDueDate,
  emptyAction,
  isOverdue,
  localToday,
  normalizeAction,
  validateAction,
} from './actions.js';

const event = { plantId: 'plant-lyon', pillarId: 'pillar-hs', location: { departmentId: 'd1', workshopId: 'w1', jobId: 'j1' } };

function completeAction(changes = {}) {
  return {
    ...emptyAction('w1', event),
    description: 'Extend the cleaning contract',
    assigneeIds: ['user-diego'],
    dueDate: '2026-11-30',
    priority: 'High',
    notifyMaintenance: false,
    ...changes,
  };
}

describe('actions (005)', () => {
  it('starts Planned at the event location', () => {
    const action = emptyAction('w1', event);
    expect(action).toMatchObject({ status: 'planned', whyId: 'w1', location: event.location, notifyMaintenance: null });
  });

  it('needs a description, 1 to 5 assignees, a due date, a priority and Notify maintenance', () => {
    expect(Object.keys(validateAction(emptyAction(null, {})))).toEqual([
      'description',
      'assigneeIds',
      'dueDate',
      'priority',
      'notifyMaintenance',
    ]);
    expect(validateAction(completeAction())).toEqual({});
    expect(Object.keys(validateAction(completeAction({ assigneeIds: ['a', 'b', 'c', 'd', 'e', 'f'] })))).toEqual(['assigneeIds']);
  });

  it('reads actions saved before with defaults', () => {
    const old = { id: 'a1', whyId: 'w2', description: 'x', assigneeIds: [], dueDate: '', priority: 'Low' };
    expect(normalizeAction(old, event)).toMatchObject({ status: 'planned', notifyMaintenance: null, whyId: 'w2', dueDateHistory: [], location: event.location });
  });

  it('is Overdue when deployed, not finished and due before today', () => {
    const today = '2026-10-26';
    expect(isOverdue(completeAction({ status: 'onGoing', dueDate: '2026-10-25' }), today)).toBe(true);
    expect(isOverdue(completeAction({ status: 'onGoing', dueDate: '2026-10-26' }), today)).toBe(false);
    expect(isOverdue(completeAction({ status: 'planned', dueDate: '2026-10-25' }), today)).toBe(false);
    expect(isOverdue(completeAction({ status: 'completed', dueDate: '2026-10-25' }), today)).toBe(false);
  });

  it('keeps the due date history, newest first', () => {
    let action = changeDueDate(completeAction({ dueDate: '2026-10-25' }), '2026-11-02', 'user-carla', 'T1');
    action = changeDueDate(action, '2026-11-09', 'user-carla', 'T2');
    expect(action.dueDateHistory).toEqual([
      { from: '2026-11-02', to: '2026-11-09', by: 'user-carla', at: 'T2' },
      { from: '2026-10-25', to: '2026-11-02', by: 'user-carla', at: 'T1' },
    ]);
    expect(changeDueDate(action, '2026-11-09', 'user-carla', 'T3')).toEqual(action);
  });

  it('offers the users of the plant who can see the pillar', () => {
    const ids = actionCandidates(event, users).map((user) => user.id);
    expect(ids).toContain('user-diego');
    expect(ids).not.toContain('user-felix');
  });

  it('finds the actions of a set of whys and gives the local date', () => {
    expect(actionsOfWhys([{ id: 'a1', whyId: 'w1' }, { id: 'a2', whyId: 'w2' }], ['w2'])).toEqual([{ id: 'a2', whyId: 'w2' }]);
    expect(localToday(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
