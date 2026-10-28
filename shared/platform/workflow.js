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

// The critical row of a pillar, after its levels: phases added to an event once its review flags it
// (012 WF-13). Stored like a level, with the reserved level code 'critical'.
export const CRITICAL_LEVEL = 'critical';
export const CRITICAL_PHASES = ['rootCause', 'actions', 'validation'];
export const CRITICAL_ROWS = {
  'pillar-hs': { code: 'SIP/HCI', label: 'Flagged SIP or HCI by the review', flags: 'SIP or HCI' },
  'pillar-env': { code: 'SIP', label: 'Flagged SIP by the review', flags: 'SIP' },
  'pillar-ir': { code: 'SPL/HCL', label: 'Flagged SPL or HCL by the review', flags: 'SPL or HCL' },
};

// How a row is named in messages: its level code, or the critical row's code.
export function levelLabel(pillarId, levelCode) {
  return levelCode === CRITICAL_LEVEL ? CRITICAL_ROWS[pillarId]?.code ?? levelCode : levelCode;
}

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

const keptSources = (sources) =>
  sources.map((setting) => ({ settingId: setting.id, scopeLevel: setting.scopeLevel, authorId: setting.authorId }));

// Reviewers chosen by a level for its plants (013 WF-6a): a setting of their own, phase
// 'reviewers', kept per level row like the Required settings but never a phase of the event.
export const REVIEWERS = 'reviewers';
export const SETTING_LABELS = { ...PHASE_LABELS, [REVIEWERS]: 'Reviewers' };

// Every reviewers choice applying at a plant for one level row, highest level first. Review settings
// saved before 013 still holding reviewers count as choices too.
export function reviewerChoices(settings, { pillarId, levelCode, plantId }) {
  return settings
    .filter(
      (setting) =>
        setting.pillarId === pillarId &&
        setting.levelCode === levelCode &&
        (setting.phase === REVIEWERS || setting.phase === 'review') &&
        (setting.reviewerIds || []).length > 0 &&
        settingApplies(setting, plantId),
    )
    .sort(byLevelDescending);
}

// The reviewers of every level, added together (013 WF-11).
export function reviewersAt(settings, cell) {
  return [...new Set(reviewerChoices(settings, cell).flatMap((setting) => setting.reviewerIds))];
}

// A Required Review with nobody able to review at that plant (013 WF-8).
export function hasNoReviewer(settings, users, { pillarId, levelCode, plantId }) {
  if (!resultingWorkflow(settings, { pillarId, levelCode, plantId }).review.required) return false;
  const ids = reviewersAt(settings, { pillarId, levelCode, plantId });
  return !users.some((user) => ids.includes(user.id) && canReviewAt(user, pillarId, plantId));
}

// The reviewers choices of the user's level on one level row (theirs or a colleague's).
export function ownReviewerChoices(user, settings, { pillarId, levelCode }) {
  return settings.filter(
    (setting) => setting.phase === REVIEWERS && setting.pillarId === pillarId && setting.levelCode === levelCode && canEditSetting(user, setting),
  );
}

// Reviewers can be chosen where Review is Required at one of the user's plants (013 WF-6a).
export function canChooseReviewers(user, settings, { pillarId, levelCode }) {
  const role = getRole(user, pillarId);
  if (!role) return false;
  return settings.some(
    (setting) =>
      setting.phase === 'review' &&
      setting.pillarId === pillarId &&
      setting.levelCode === levelCode &&
      (setting.scopeLevel === 'central' || role.level === 'central' || plantsOverlap(setting.plantIds, role.plantIds)),
  );
}

// The workflow kept on an event at submission (FR-012, research R6), with its critical row's
// phases, applied if the review flags it (012 WF-11).
export function workflowForEvent(settings, users, event) {
  const result = resultingWorkflow(settings, event);
  const phases = {};
  for (const phase of PHASES) {
    const { required, sources } = result[phase];
    phases[phase] = { required, sources: keptSources(sources) };
  }
  const criticalResult = resultingWorkflow(settings, { ...event, levelCode: CRITICAL_LEVEL });
  const critical = Object.fromEntries(
    CRITICAL_PHASES.map((phase) => [phase, { required: criticalResult[phase].required, sources: keptSources(criticalResult[phase].sources) }]),
  );
  // The reviewers chosen at every level covering the plant, limited to people who can see the event.
  const reviewerIds = new Set(reviewersAt(settings, event));
  phases.review.reviewerIds = users
    .filter((user) => reviewerIds.has(user.id) && canReviewAt(user, event.pillarId, event.plantId))
    .map((user) => user.id);
  return { computedAt: new Date().toISOString(), phases, critical };
}

// Root cause analysis needs a review (review 2026-10-25): for each plant where a setting requires
// Root cause analysis, Review must be Required for the same pillar and level. Returns the
// { levelCode, plantId } pairs breaking that rule. Not the critical row: a flagged event was
// reviewed (012 WF-5a).
export function analysisWithoutReview(settings, allPlantIds) {
  const broken = [];
  for (const setting of settings.filter((item) => item.phase === 'rootCause' && item.levelCode !== CRITICAL_LEVEL)) {
    const plantIds = setting.scopeLevel === 'central' ? allPlantIds : setting.plantIds;
    for (const plantId of plantIds) {
      const result = resultingWorkflow(settings, { pillarId: setting.pillarId, levelCode: setting.levelCode, plantId });
      const known = broken.some((item) => item.levelCode === setting.levelCode && item.plantId === plantId);
      if (!result.review.required && !known) broken.push({ levelCode: setting.levelCode, plantId });
    }
  }
  return broken;
}

// True when nothing besides Submission is Required: the event is Closed at once (FR-026).
export function isOnlySubmission(workflow) {
  return CONFIGURABLE_PHASES.every((phase) => !workflow.phases[phase].required);
}
