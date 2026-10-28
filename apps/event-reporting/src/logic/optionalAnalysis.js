// Starting a root cause analysis nobody required (feature 010, RCA-18): the event's reviewer and the
// Managers and Site Admins who can see it start it on its Optional step, any time after a valid
// review — a Closed event reopens.

import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { stepStates } from './review.js';
import { membersOf } from '../../../../shared/platform/groups.js';

export const START_ERROR = 'Choose who will perform the root cause analysis.';

export function analysisIsOptional(event) {
  return stepStates(event).find((item) => item.step === 'rootCause').state === 'optional';
}

export function canStartAnalysis(user, event) {
  if (!analysisIsOptional(event)) return false;
  if (event.review?.reviewerId === user.id) return true;
  return ['Manager', 'Site Admin'].includes(user.role) && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId);
}

// rcaAssignees = { userIds, groupIds }; the error message, or '' when someone is designated.
export function validateStart(rcaAssignees) {
  return rcaAssignees.userIds.length + rcaAssignees.groupIds.length > 0 ? '' : START_ERROR;
}

// Root cause analysis becomes a required step; a Closed event is In Progress again.
export function startAnalysis(event, rcaAssignees, user, now) {
  return {
    ...event,
    optionalAnalysis: { startedBy: user.id, startedAt: now, rcaAssignees },
    status: 'In Progress',
    closedAt: null,
    updatedBy: user.id,
    updatedAt: now,
  };
}

// The people to alert: the designated users and group members, never the person who started it.
export function startedAnalystIds(event, groups) {
  const { rcaAssignees, startedBy } = event.optionalAnalysis;
  const ids = [...rcaAssignees.userIds, ...membersOf(groups, rcaAssignees.groupIds)];
  return [...new Set(ids)].filter((id) => id !== startedBy);
}
