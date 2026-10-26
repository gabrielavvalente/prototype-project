import { describe, expect, it } from 'vitest';
import { users } from '../../../../shared/platform/sampleData.js';
import {
  analysisCompletedCandidates,
  deliverAlerts,
  planCompletedCandidates,
  planDeployedCandidates,
  reviewCandidates,
  submissionCandidates,
  validationCandidates,
} from './notifications.js';

const LYON_REVIEWERS = ['user-carla', 'user-eva', 'user-diego'];

// A Lyon H&S event reported by Ana, with Review required.
function makeEvent(changes = {}) {
  return {
    id: 'e1',
    plantId: 'plant-lyon',
    pillarId: 'pillar-hs',
    levelCode: 'TF3',
    location: { departmentId: 'plant-lyon/department-2' },
    reporterId: 'user-ana',
    createdBy: 'user-ana',
    sharedWithIds: [],
    status: 'Open',
    workflow: { phases: { review: { required: true, reviewerIds: LYON_REVIEWERS } } },
    ...changes,
  };
}

const deliver = (candidates, event, actorId, settings = []) => deliverAlerts(candidates, { event, actorId, users, settings });

describe('submission alerts (NT-3)', () => {
  it('asks the reviewers to review and tells the other Managers', () => {
    const event = makeEvent();
    expect(deliver(submissionCandidates(event, users, []), event, 'user-ana')).toEqual([
      { recipientId: 'user-carla', type: 'Event to review' },
      { recipientId: 'user-eva', type: 'Event to review' },
      { recipientId: 'user-diego', type: 'Event to review' },
      { recipientId: 'user-lucas', type: 'Event submitted' },
    ]);
  });

  it('tells the reporter when someone else reported, and gives a reviewer who reported "Event to review"', () => {
    const event = makeEvent({ createdBy: 'user-carla' });
    const alerts = deliver(submissionCandidates(event, users, []), event, 'user-carla');
    expect(alerts).toContainEqual({ recipientId: 'user-ana', type: 'Event reported on your behalf' });
    expect(alerts).toContainEqual({ recipientId: 'user-carla', type: 'Event to review' });
  });

  it('sends "Event submitted" to the reporting Manager and to the people of matching rules', () => {
    const event = makeEvent({ workflow: { phases: { review: { required: false } } }, reporterId: 'user-carla', createdBy: 'user-carla' });
    const rule = { plantId: 'plant-lyon', pillarId: 'pillar-hs', levelCodes: ['TF3'], departmentIds: [], userIds: ['user-ana'] };
    const alerts = deliver(submissionCandidates(event, users, [rule]), event, 'user-carla');
    expect(alerts).toContainEqual({ recipientId: 'user-carla', type: 'Event submitted' });
    expect(alerts).toContainEqual({ recipientId: 'user-ana', type: 'Event submitted' });
  });
});

describe('delivery (NT-1, NT-2)', () => {
  it('skips the person who acted for information alerts, and turned-off alerts', () => {
    const event = makeEvent({ status: 'In Progress', review: { reviewerId: 'user-carla' } });
    expect(deliver(analysisCompletedCandidates(event), event, 'user-carla')).toEqual([
      { recipientId: 'user-ana', type: 'Root cause analysis completed' },
    ]);
    const off = [{ userId: 'user-ana', type: 'Root cause analysis completed', on: false }];
    expect(deliver(analysisCompletedCandidates(event), event, 'user-diego', off)).toEqual([
      { recipientId: 'user-carla', type: 'Root cause analysis completed' },
    ]);
  });

  it('never skips work alerts, and keeps only people who see the event', () => {
    const event = makeEvent({ status: 'In Progress', review: { reviewerId: 'user-carla' } });
    const off = [{ userId: 'user-carla', type: 'Action plan ready for validation', on: false }];
    expect(deliver(planCompletedCandidates(event, ['user-carla', 'user-ben']), event, 'user-carla', off)).toEqual([
      { recipientId: 'user-carla', type: 'Action plan ready for validation' },
      { recipientId: 'user-ana', type: 'Action plan completed' },
    ]);
  });

  it('gives one alert per person: the latest stage (a closing review gives "Event closed")', () => {
    const event = makeEvent({ status: 'Closed', review: { reviewerId: 'user-carla', decision: 'valid' } });
    expect(deliver(reviewCandidates(event), event, 'user-carla')).toEqual([{ recipientId: 'user-ana', type: 'Event closed' }]);
    // With "Event closed" turned off, the earlier "Your event was reviewed" does not replace it.
    const off = [{ userId: 'user-ana', type: 'Event closed', on: false }];
    expect(deliver(reviewCandidates(event), event, 'user-carla', off)).toEqual([]);
  });
});

describe('lifecycle alerts (NT-3)', () => {
  it('archives for the reporter, the Shared with people and the other reviewers', () => {
    const event = makeEvent({ status: 'Archived', sharedWithIds: ['user-lucas'], review: { reviewerId: 'user-carla', invalidReason: 'Duplicated' } });
    expect(deliver(reviewCandidates(event), event, 'user-carla').map((alert) => alert.recipientId)).toEqual([
      'user-ana',
      'user-lucas',
      'user-eva',
      'user-diego',
    ]);
    expect(deliver(reviewCandidates(event), event, 'user-carla')[0].type).toBe('Event archived (Duplicated)');
  });

  it('tells the reporter of a valid review and assigns the analysts', () => {
    const event = makeEvent({ status: 'In Progress', review: { reviewerId: 'user-carla', decision: 'valid' } });
    expect(deliver(reviewCandidates(event, ['user-diego']), event, 'user-carla')).toEqual([
      { recipientId: 'user-ana', type: 'Your event was reviewed' },
      { recipientId: 'user-diego', type: 'Root cause analysis assigned to you' },
    ]);
  });

  it('tells the reporter and the reviewer of a deployed plan', () => {
    const event = makeEvent({ status: 'In Progress', review: { reviewerId: 'user-carla' } });
    expect(deliver(planDeployedCandidates(event), event, 'user-diego').map((alert) => alert.recipientId)).toEqual(['user-ana', 'user-carla']);
  });

  it('closes for the reporter and the Shared with people; not effective for the owners and the reporter', () => {
    const closed = makeEvent({ status: 'Closed', sharedWithIds: ['user-lucas'] });
    expect(deliver(validationCandidates(closed, ['user-diego']), closed, 'user-carla')).toEqual([
      { recipientId: 'user-ana', type: 'Event closed' },
      { recipientId: 'user-lucas', type: 'Event closed' },
    ]);
    const reopened = makeEvent({ status: 'In Progress' });
    expect(deliver(validationCandidates(reopened, ['user-diego']), reopened, 'user-carla')).toEqual([
      { recipientId: 'user-diego', type: 'Action plan not effective' },
      { recipientId: 'user-ana', type: 'Action plan not effective' },
    ]);
  });
});
