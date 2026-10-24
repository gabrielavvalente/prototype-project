// Workflow rules: which phases are Required for a plant, pillar and level, who may change a
// setting, who can review, and the workflow kept on each event (spec FR-004 to FR-012, FR-026).
// Only Required settings are stored; Optional is the absence of a setting (research R5).
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import { getPillarIdsForPlant } from './organization.js';
import { canEditSetting, getRole, LEVEL_ORDER, plantsOverlap } from './permissions.js';

export { canEditSetting };

export const PHASES = ['submission', 'review', 'rootCause', 'actions', 'validation'];

// Submission is always Required and never stored.
export const CONFIGURABLE_PHASES = PHASES.slice(1);

export const PHASE_LABELS = {
  submission: 'Submission',
  review: 'Review',
  rootCause: 'Root cause analysis',
  actions: 'Actions',
  validation: 'Validation',
};

export const REVIEWER_ROLES = ['Manager', 'Site Admin'];

// A Central setting applies everywhere; a Cluster or Local setting to its plants.
export function settingApplies(setting, plantId) {
  return setting.scopeLevel === 'central' || setting.plantIds.includes(plantId);
}

function isSameCell(setting, { pillarId, levelCode, phase }) {
  return setting.pillarId === pillarId && setting.levelCode === levelCode && setting.phase === phase;
}

// Highest level first (Central, Cluster, Local), so the first source is the one shown as origin.
function byLevelDescending(a, b) {
  return LEVEL_ORDER[b.scopeLevel] - LEVEL_ORDER[a.scopeLevel];
}

// For one plant, pillar and level: each phase's { required, sources } (FR-007).
export function resultingWorkflow(settings, { pillarId, levelCode, plantId }) {
  const result = { submission: { required: true, sources: [] } };
  for (const phase of CONFIGURABLE_PHASES) {
    const sources = settings
      .filter((setting) => isSameCell(setting, { pillarId, levelCode, phase }) && settingApplies(setting, plantId))
      .sort(byLevelDescending);
    result[phase] = { required: sources.length > 0, sources };
  }
  return result;
}

// What the Settings view shows in one cell for the signed-in user (FR-006, FR-008):
// 'locked' when a higher level requires it for the user's plants, 'mine' when a setting of the
// user's level exists (theirs or a colleague's), otherwise 'optional'.
export function cellStateFor(user, settings, cell) {
  const role = getRole(user, cell.pillarId);
  const relevant = settings.filter(
    (setting) =>
      isSameCell(setting, cell) &&
      (setting.scopeLevel === 'central' || plantsOverlap(setting.plantIds, role.plantIds)),
  );
  const higher = relevant
    .filter((setting) => LEVEL_ORDER[setting.scopeLevel] > LEVEL_ORDER[role.level])
    .sort(byLevelDescending);
  const mine = relevant.filter((setting) => canEditSetting(user, setting));
  if (higher.length > 0) {
    return { state: 'locked', lockedBy: higher, mine };
  }
  return { state: mine.length > 0 ? 'mine' : 'optional', lockedBy: [], mine };
}

function canReviewAt(user, pillarId, plantId) {
  return REVIEWER_ROLES.includes(user.role) && getPillarIdsForPlant(user, plantId).includes(pillarId);
}

// Managers and Site Admins who can see the pillar at one of the plants at least (FR-010).
export function validReviewers(users, { pillarId, plantIds }) {
  return users.filter((user) => plantIds.some((plantId) => canReviewAt(user, pillarId, plantId)));
}

// The workflow kept on an event at submission (FR-012, research R6).
export function workflowForEvent(settings, users, event) {
  const result = resultingWorkflow(settings, event);
  const phases = {};
  for (const phase of PHASES) {
    const { required, sources } = result[phase];
    phases[phase] = {
      required,
      sources: sources.map((setting) => ({
        settingId: setting.id,
        scopeLevel: setting.scopeLevel,
        authorId: setting.authorId,
      })),
    };
  }
  // Reviewers of every setting requiring Review, limited to people who can see the event.
  const reviewerIds = new Set(result.review.sources.flatMap((setting) => setting.reviewerIds));
  phases.review.reviewerIds = users
    .filter((user) => reviewerIds.has(user.id) && canReviewAt(user, event.pillarId, event.plantId))
    .map((user) => user.id);
  return { computedAt: new Date().toISOString(), phases };
}

// True when nothing besides Submission is Required: the event is Closed at once (FR-026).
export function isOnlySubmission(workflow) {
  return CONFIGURABLE_PHASES.every((phase) => !workflow.phases[phase].required);
}
