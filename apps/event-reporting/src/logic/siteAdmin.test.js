import { describe, expect, it } from 'vitest';
import { isPlantSiteAdmin } from './access.js';
import { allowedStatuses, canEditPlan } from './actionPlan.js';
import { deliverAlerts, submissionCandidates } from './notifications.js';
import { canValidate } from './planValidation.js';
import { historianEntries } from './recordHistorian.js';
import { canStartReview } from './review.js';
import { canPerformAnalysis } from './rootCause.js';
import { canPublish } from './safetyCommunication.js';

// The Site Admin of Lyon, seeing Health & Safety only, and a Manager there (014).
const lyon = (pillarIds) => [{ businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds }];
const siteAdmin = { id: 'user-sa', name: 'Sam Admin', role: 'Site Admin', access: lyon(['pillar-hs']) };
const otherSiteAdmin = { id: 'user-sb', role: 'Site Admin', access: [{ businessId: 'biz-auto', plantId: 'plant-curitiba', pillarIds: ['pillar-hs'] }] };
const manager = { id: 'user-m', role: 'Manager', access: lyon(['pillar-hs', 'pillar-env']) };
const reviewer = { id: 'user-r', role: 'Manager', access: lyon(['pillar-hs', 'pillar-env']) };
const users = [siteAdmin, otherSiteAdmin, manager, reviewer];

function phases(required) {
  return Object.fromEntries(
    ['submission', 'review', 'rootCause', 'actions', 'validation'].map((phase) => [phase, { required: phase === 'submission' || required.includes(phase), sources: [] }]),
  );
}

// An Environment event of Lyon: the Site Admin cannot see the pillar, yet acts on it.
function event(changes = {}) {
  const workflow = { phases: phases(['review', 'rootCause', 'actions', 'validation']) };
  workflow.phases.review.reviewerIds = ['user-r'];
  return { id: 'e1', plantId: 'plant-lyon', businessId: 'biz-auto', pillarId: 'pillar-env', familyCode: 'EVE', levelCode: 'EvE2', status: 'Open', workflow, review: null, ...changes };
}
const reviewed = { decision: 'valid', reviewerId: 'user-r', reviewedAt: '2026-10-29', criticalFlags: [], rcaAssignees: { userIds: ['user-m'], groupIds: [] } };

describe('Site Admin of the plant (014)', () => {
  it('is the Site Admin of the event plant only', () => {
    expect(isPlantSiteAdmin(siteAdmin, event())).toBe(true);
    expect(isPlantSiteAdmin(otherSiteAdmin, event())).toBe(false);
    expect(isPlantSiteAdmin(manager, event())).toBe(false);
  });

  it('takes a review over, even from another reviewer (RV-2, RV-3)', () => {
    expect(canStartReview(siteAdmin, event())).toBe(true);
    const taken = event({ status: 'In Progress', review: { reviewerId: 'user-r', decision: null } });
    expect(canStartReview(siteAdmin, taken)).toBe(true);
    expect(canStartReview(manager, taken)).toBe(false);
    expect(canStartReview(otherSiteAdmin, taken)).toBe(false);
  });

  it('performs the analysis without being designated (RCA-7)', () => {
    const analysing = event({ status: 'In Progress', review: reviewed });
    expect(canPerformAnalysis(siteAdmin, analysing, [])).toBe(true);
    expect(canPerformAnalysis(reviewer, analysing, [])).toBe(false);
  });

  it('acts as plan owner and for the assignees (AP-2, AP-10)', () => {
    const planning = event({ status: 'In Progress', review: reviewed, rca: { completedAt: '2026-10-29' }, actions: [] });
    expect(canEditPlan(siteAdmin, planning, [], users)).toBe(true);
    const action = { id: 'a1', assigneeIds: ['user-m'], status: 'onGoing' };
    expect(allowedStatuses(siteAdmin, action, true, true)).toEqual(['toComplete', 'completed', 'cancelled']);
    expect(allowedStatuses(reviewer, action, false)).toEqual([]);
  });

  it('validates and reworks (VAL-1, VAL-7)', () => {
    expect(canValidate(siteAdmin, event({ review: reviewed }), users)).toBe(true);
    expect(canValidate(manager, event({ review: reviewed }), users)).toBe(false);
  });

  it('publishes the Safety Warning draft (SC-7)', () => {
    const draft = event({ status: 'In Progress', review: reviewed, rca: { completedAt: '2026-10-29' }, actionPlan: { deployedAt: '2026-10-29' } });
    expect(canPublish(siteAdmin, draft, [], users)).toBe(true);
    expect(canPublish(reviewer, draft, [], users)).toBe(false);
  });

  it('gets "Event submitted", even without the pillar (NT-3)', () => {
    const submitted = event({ reporterId: 'user-m', createdBy: 'user-m' });
    const candidates = submissionCandidates(submitted, users, []);
    expect(candidates.filter((item) => item.key === 'Event submitted').map((item) => item.recipientId)).toEqual(['user-sa', 'user-m']);
    const alerts = deliverAlerts(candidates, { event: submitted, actorId: 'user-m', users });
    expect(alerts.map((alert) => `${alert.recipientId}:${alert.type}`).sort()).toEqual(['user-m:Event submitted', 'user-r:Event to review', 'user-sa:Event submitted']);
  });
});

describe('Record Historian of a correction after the review (014 ER-21)', () => {
  it('lists the report fields changed', () => {
    const before = event({ status: 'In Progress', review: reviewed, title: 'Oil leak', levelCode: 'EvE2' });
    const after = { ...before, title: 'Oil leak under press 4', levelCode: 'EvE3' };
    const entries = historianEntries(before, after, { userId: 'user-sa', now: '2026-10-29T10:00:00Z', users });
    expect(entries.map((entry) => `${entry.what}: ${entry.before} → ${entry.after}`)).toEqual(['Title: Oil leak → Oil leak under press 4', 'Level: EvE2 → EvE3']);
  });
});
