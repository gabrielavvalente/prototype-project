// The alerts of the event lifecycle (feature 007): each stage lists its candidates (NT-3) and
// deliverAlerts keeps the ones to raise (NT-1, NT-2, research R2).
// A candidate is { recipientId, key, type, work }: key is the catalogue name (settings, stage
// order), type the stored text ("Event archived (Duplicated)").

import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { ruleRecipientIds, settingFor, STAGE_ORDER } from '../../../../shared/platform/notifications.js';
import { getManagersToAlert } from './access.js';

const information = (ids, key, type = key) => ids.filter(Boolean).map((recipientId) => ({ recipientId, key, type, work: false }));
const work = (ids, key) => ids.filter(Boolean).map((recipientId) => ({ recipientId, key, type: key, work: true }));

const reviewerIdsOf = (event) => (event.workflow?.phases.review?.required ? event.workflow.phases.review.reviewerIds || [] : []);

// "Event closed" to the reporter and the Shared with people (NT-3).
export function closedCandidates(event) {
  return event.status === 'Closed' ? information([event.reporterId, ...(event.sharedWithIds || [])], 'Event closed') : [];
}

// Submission: the reviewers, the other Managers, the rules' people, the reporter when someone else
// reported, the Shared with people. Closing at submission raises no "Event closed" (NT-3, NT-9).
export function submissionCandidates(event, users, rules) {
  const reviewerIds = reviewerIdsOf(event);
  const managerIds = getManagersToAlert(users, event)
    .map((user) => user.id)
    .filter((id) => !reviewerIds.includes(id));
  return [
    ...work(reviewerIds, 'Event to review'),
    ...information([...managerIds, ...ruleRecipientIds(rules, event)], 'Event submitted'),
    ...(event.createdBy && event.createdBy !== event.reporterId ? information([event.reporterId], 'Event reported on your behalf') : []),
    ...information(event.sharedWithIds || [], 'Event shared with you'),
  ];
}

// A completed review: archived, or valid (with the analysts to alert and a possible closure).
export function reviewCandidates(event, analystIds = []) {
  if (event.status === 'Archived') {
    const otherReviewers = reviewerIdsOf(event).filter((id) => id !== event.review?.reviewerId);
    return information(
      [event.reporterId, ...(event.sharedWithIds || []), ...otherReviewers],
      'Event archived',
      `Event archived (${event.review.invalidReason})`,
    );
  }
  return [
    ...information([event.reporterId], 'Your event was reviewed'),
    ...work(analystIds, 'Root cause analysis assigned to you'),
    ...closedCandidates(event),
  ];
}

export function analysisCompletedCandidates(event) {
  return [...information([event.reporterId, event.review?.reviewerId], 'Root cause analysis completed'), ...closedCandidates(event)];
}

export function planDeployedCandidates(event) {
  return information([event.reporterId, event.review?.reviewerId], 'Action plan deployed');
}

// A plan that completed by itself: Validation next, or closed (AP-12).
export function planCompletedCandidates(event, validatorIds) {
  if (event.status === 'Closed') return closedCandidates(event);
  return [...work(validatorIds, 'Action plan ready for validation'), ...information([event.reporterId], 'Action plan completed')];
}

// Effective: closed. Not effective: the owners must act, the reporter is told (VAL-3, VAL-4).
export function validationCandidates(event, ownerIds) {
  if (event.status === 'Closed') return closedCandidates(event);
  return [...work(ownerIds, 'Action plan not effective'), ...information([event.reporterId], 'Action plan not effective')];
}

const stageOf = (candidate) => STAGE_ORDER.indexOf(candidate.key);

// Keeps people who can see the event; drops information alerts to the person who acted ("Event
// submitted" excepted); keeps one alert per person — work first, then the latest stage — and only
// then drops it when the person turned it off, so a turned-off "Event closed" is not replaced by
// an earlier stage. Returns [{ recipientId, type }] (NT-1, NT-2).
export function deliverAlerts(candidates, { event, actorId, users, settings = [] }) {
  const kept = new Map();
  for (const candidate of candidates) {
    const person = users.find((user) => user.id === candidate.recipientId);
    if (!person?.role || !getPillarIdsForPlant(person, event.plantId).includes(event.pillarId)) continue;
    if (!candidate.work && candidate.recipientId === actorId && candidate.key !== 'Event submitted') continue;
    const current = kept.get(candidate.recipientId);
    const better =
      !current || (candidate.work && !current.work) || (candidate.work === current.work && stageOf(candidate) > stageOf(current));
    if (better) kept.set(candidate.recipientId, candidate);
  }
  return [...kept.values()]
    .filter((candidate) => candidate.work || settingFor(settings, candidate.recipientId, candidate.key).on)
    .map(({ recipientId, type }) => ({ recipientId, type }));
}

// "Shared event received" to the Site Admins and Managers of each plant a share reached, who cannot
// see the event itself; not to the person who shared, nor when turned off. Each alert keeps the
// receiving plant (SH-6, NT-1, 009 research R5). Returns [{ recipientId, type, plantId }].
export function sharedAlerts(plantIds, { actorId, users, settings = [] }) {
  return plantIds.flatMap((plantId) =>
    users
      .filter((user) => ['Site Admin', 'Manager'].includes(user.role) && (user.access || []).some((entry) => entry.plantId === plantId))
      .filter((user) => user.id !== actorId && settingFor(settings, user.id, 'Shared event received').on)
      .map((user) => ({ recipientId: user.id, type: 'Shared event received', plantId })),
  );
}

// An optional analysis started (010 RCA-18): the designated people get their work alert.
export function analysisStartedCandidates(analystIds) {
  return work(analystIds, 'Root cause analysis assigned to you');
}

// A rework sends the event back to its plan owners (011 VAL-7).
export function reworkCandidates(ownerIds) {
  return work(ownerIds, 'Event sent back for rework');
}
