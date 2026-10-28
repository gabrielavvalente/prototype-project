import { describe, expect, it } from 'vitest';
import { users } from '../../../../shared/platform/sampleData.js';
import { filterEntries, historianEntries } from './recordHistorian.js';

const reviewed = {
  id: 'e1',
  status: 'In Progress',
  review: { decision: 'valid', statement: 'A worker fell from a ladder.' },
  actions: [{ id: 'a1', description: 'Fix the ladder storage rack', assigneeIds: ['user-ana'], dueDate: '2026-11-09', priority: 'High', status: 'onGoing' }],
  actionPlan: { deployedAt: '2026-10-26T09:00:00.000Z' },
  validations: [],
};
const options = (now, userId = 'user-carla') => ({ userId, now, users });

describe('Record Historian entries (RH-1)', () => {
  it('records nothing before the review is complete', () => {
    expect(historianEntries({ ...reviewed, review: null }, { ...reviewed, status: 'Closed' }, options('2026-10-26T10:00:00.000Z'))).toEqual([]);
  });

  it('records each changed field, with before and after', () => {
    const after = { ...reviewed, actions: [{ ...reviewed.actions[0], dueDate: '2026-11-16', status: 'completed' }] };
    expect(historianEntries(reviewed, after, options('2026-10-26T10:00:00.000Z'))).toEqual([
      { at: '2026-10-26T10:00:00.000Z', by: 'user-carla', what: 'Corrective action › Fix the ladder storage rack › Due date', before: '9 Nov 2026', after: '16 Nov 2026' },
      { at: '2026-10-26T10:00:00.000Z', by: 'user-carla', what: 'Corrective action › Fix the ladder storage rack › Status', before: 'On Going', after: 'Completed' },
    ]);
  });

  it('records added actions, the validation with its reason and the status', () => {
    const after = {
      ...reviewed,
      status: 'In Progress',
      actions: [...reviewed.actions, { id: 'a2', description: 'Night check', assigneeIds: ['user-ana'], dueDate: '2026-11-02', priority: 'Low', status: 'onGoing' }],
      validations: [{ effective: false, rework: true, reason: 'Guard rail still loose' }],
    };
    const entries = historianEntries(reviewed, after, options('2026-10-26T10:00:00.000Z'));
    expect(entries).toContainEqual({ at: '2026-10-26T10:00:00.000Z', by: 'user-carla', what: 'Validation', before: '—', after: 'Rework', reason: 'Guard rail still loose' });
    expect(entries.find((entry) => entry.what === 'Corrective action › Night check').after).toBe('Added — On Going · Ana Ribeiro · due 2 Nov 2026');
  });
});

describe('filters (RH-2)', () => {
  const entries = [
    { at: '2026-10-20T10:00:00.000Z', by: 'user-carla', what: 'Status', before: 'Open', after: 'In Progress' },
    { at: '2026-10-26T10:00:00.000Z', by: 'user-diego', what: 'Learnings', before: '—', after: 'Check rails' },
    { at: '2026-10-27T10:00:00.000Z', by: 'user-carla', what: 'Status', before: 'In Progress', after: 'Closed' },
  ];
  it('filters by dates, person and field, newest first', () => {
    expect(filterEntries(entries).map((entry) => entry.at.slice(0, 10))).toEqual(['2026-10-27', '2026-10-26', '2026-10-20']);
    expect(filterEntries(entries, { userId: 'user-carla', what: 'Status' })).toHaveLength(2);
    expect(filterEntries(entries, { from: '2026-10-26', to: '2026-10-26' }).map((entry) => entry.what)).toEqual(['Learnings']);
  });
});
