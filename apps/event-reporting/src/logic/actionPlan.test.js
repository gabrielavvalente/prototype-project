import { describe, expect, it } from 'vitest';
import { investigationGroups, users } from '../../../../shared/platform/sampleData.js';
import {
  addAction,
  allowedStatuses,
  canEditPlan,
  deleteAction,
  deployPlan,
  isPlanFinished,
  planOwners,
  planSummary,
  setActionStatus,
  updateAction,
} from './actionPlan.js';

const NOW = '2026-10-26T10:00:00.000Z';
const byId = (id) => users.find((user) => user.id === id);
const sent = (alerts) => alerts.map(({ recipientId, type }) => ({ recipientId, type }));

function phases(required) {
  return Object.fromEntries(
    ['submission', 'review', 'rootCause', 'actions', 'validation'].map((phase) => [
      phase,
      { required: phase === 'submission' || required.includes(phase), sources: [] },
    ]),
  );
}

function action(id, changes = {}) {
  return { id, whyId: null, description: id, assigneeIds: ['user-ana'], dueDate: '2026-11-09', priority: 'High', status: 'planned', dueDateHistory: [], ...changes };
}

// A Lyon H&S event reviewed by Carla, at Actions.
function makeEvent(required, changes = {}) {
  return {
    id: 'e1',
    status: 'In Progress',
    plantId: 'plant-lyon',
    pillarId: 'pillar-hs',
    workflow: { phases: phases(required) },
    review: { decision: 'valid', reviewerId: 'user-carla', rcaAssignees: null },
    actions: [],
    actionPlan: null,
    ...changes,
  };
}

describe('action plan owners (005)', () => {
  it('are the designated people, else the reviewer, else the Managers', () => {
    const analysed = makeEvent(['review', 'actions'], {
      review: { decision: 'valid', reviewerId: 'user-carla', rcaAssignees: { userIds: ['user-diego'], groupIds: ['group-lyon-hs'] } },
    });
    expect(planOwners(analysed, investigationGroups, users)).toEqual(['user-diego', 'user-carla', 'user-eva', 'user-ana']);
    expect(planOwners(makeEvent(['review', 'actions']), investigationGroups, users)).toEqual(['user-carla']);
    const noReview = makeEvent(['actions'], { review: null, status: 'Open' });
    expect(planOwners(noReview, investigationGroups, users)).toEqual(['user-carla', 'user-diego', 'user-lucas']);
    const waiting = makeEvent(['review', 'actions'], { review: null, status: 'Open' });
    expect(planOwners(waiting, investigationGroups, users)).toEqual([]);
  });

  it('edit while Actions is current or Optional, until completed', () => {
    const event = makeEvent(['review', 'actions']);
    expect(canEditPlan(byId('user-carla'), event, investigationGroups, users)).toBe(true);
    expect(canEditPlan(byId('user-diego'), event, investigationGroups, users)).toBe(false);
    const optional = makeEvent(['review'], { status: 'In Progress', review: { reviewerId: 'user-carla', decision: null } });
    expect(canEditPlan(byId('user-carla'), optional, investigationGroups, users)).toBe(true);
    const closed = makeEvent(['review'], { status: 'Closed' });
    expect(canEditPlan(byId('user-carla'), closed, investigationGroups, users)).toBe(false);
    const analysing = makeEvent(['review', 'rootCause'], { review: { decision: 'valid', reviewerId: 'user-carla', rcaAssignees: { userIds: ['user-carla'], groupIds: [] } } });
    expect(canEditPlan(byId('user-carla'), analysing, investigationGroups, users)).toBe(false);
  });
});

describe('action plan lifecycle (005)', () => {
  it('deploys Planned actions and tells the reviewer, not the assignees (007)', () => {
    const event = makeEvent(['review', 'actions'], {
      actions: [action('a1', { assigneeIds: ['user-ana', 'user-diego'] }), action('a2', { assigneeIds: ['user-diego', 'user-felix'] })],
    });
    const { event: deployed, alerts } = deployPlan(event, 'user-carla', NOW, users);
    expect(deployed.actions.map((item) => item.status)).toEqual(['onGoing', 'onGoing']);
    expect(deployed.actionPlan).toMatchObject({ deployedBy: 'user-carla', deployedAt: NOW, completedAt: null });
    expect(sent(alerts)).toEqual([{ recipientId: 'user-carla', type: 'Action plan deployed' }]);
  });

  it('adds On Going actions after deployment', () => {
    const deployed = makeEvent(['review', 'actions'], { actionPlan: { deployedAt: NOW } });
    expect(addAction(deployed, action('a3'), 'user-carla', NOW).actions[0].status).toBe('onGoing');
    expect(addAction(makeEvent(['review', 'actions']), action('a4'), 'user-carla', NOW).actions[0].status).toBe('planned');
  });

  it('records due date changes and deletes Planned actions only', () => {
    const event = makeEvent(['review', 'actions'], { actions: [action('a1'), action('a2', { status: 'onGoing' })] });
    const moved = updateAction(event, { ...event.actions[0], dueDate: '2026-11-16' }, 'user-carla', NOW);
    expect(moved.actions[0].dueDateHistory).toEqual([{ from: '2026-11-09', to: '2026-11-16', by: 'user-carla', at: NOW }]);
    expect(deleteAction(event, 'a1').actions.map((item) => item.id)).toEqual(['a2']);
    expect(deleteAction(event, 'a2').actions).toHaveLength(2);
  });

  it('lets the assignee move their action forward and the owner cancel it', () => {
    const onGoing = action('a1', { status: 'onGoing' });
    expect(allowedStatuses(byId('user-ana'), onGoing, false)).toEqual(['toComplete', 'completed']);
    expect(allowedStatuses(byId('user-ana'), { ...onGoing, status: 'toComplete' }, false)).toEqual(['completed']);
    expect(allowedStatuses(byId('user-carla'), onGoing, true)).toEqual(['cancelled']);
    expect(allowedStatuses(byId('user-ana'), { ...onGoing, status: 'completed' }, true)).toEqual([]);
    expect(allowedStatuses(byId('user-ana'), action('a2'), true)).toEqual([]);
  });

  it('counts the immediate actions in the plan', () => {
    const event = makeEvent(['review', 'actions'], {
      immediateActions: [{ id: 'i1' }],
      actions: [action('a1', { status: 'onGoing' }), action('a2', { status: 'onGoing', dueDate: '2026-10-25' })],
      actionPlan: { deployedAt: NOW },
    });
    expect(planSummary(event, '2026-10-26')).toEqual({ count: 3, completed: 1, overdue: 1, deployed: true });
  });

  it('completes by itself with the change that finishes the last action, then goes to Validation', () => {
    let event = makeEvent(['review', 'actions', 'validation'], {
      actions: [action('a1', { status: 'onGoing' }), action('a2', { status: 'onGoing' })],
      actionPlan: { deployedAt: NOW },
    });
    let result = setActionStatus(event, 'a1', 'completed', 'user-ana', NOW, users);
    expect(result.event.actionPlan.completedAt).toBeFalsy();
    result = setActionStatus(result.event, 'a2', 'cancelled', 'user-carla', NOW, users);
    expect(result.event).toMatchObject({ status: 'In Progress', actionPlan: { completedBy: 'user-carla', completedAt: NOW } });
    expect(sent(result.alerts)).toEqual([{ recipientId: 'user-carla', type: 'Action plan ready for validation' }]);
    event = makeEvent(['review', 'actions'], { actions: [action('a1', { status: 'onGoing' })], actionPlan: { deployedAt: NOW } });
    expect(setActionStatus(event, 'a1', 'completed', 'user-ana', NOW, users).event.status).toBe('Closed');
  });

  it('completes at deployment when the immediate actions are enough', () => {
    const event = makeEvent(['review', 'actions'], { immediateActions: [{ id: 'i1' }] });
    const { event: deployed } = deployPlan(event, 'user-felix', NOW, users);
    expect(deployed).toMatchObject({ status: 'Closed', actionPlan: { completedAt: NOW } });
  });

  it('is not finished before deploying, with an open action, or with only cancelled actions', () => {
    expect(isPlanFinished(makeEvent(['review', 'actions'], { actions: [action('a1', { status: 'completed' })] }))).toBe(false);
    const open = makeEvent(['review', 'actions'], { actions: [action('a1', { status: 'onGoing' })], actionPlan: { deployedAt: NOW } });
    expect(isPlanFinished(open)).toBe(false);
    const cancelled = makeEvent(['review', 'actions'], { actions: [action('a1', { status: 'cancelled' })], actionPlan: { deployedAt: NOW } });
    expect(isPlanFinished(cancelled)).toBe(false);
  });
});
