// The Safety Alert and the Safety Warning of an event (feature 008). Both are built from an
// allow-list of the event's fields, so they never carry a name (SC-2, research R2); only a
// published Warning is stored, as a frozen copy (research R1).

import { isPlantSiteAdmin } from './access.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { ACTION_STATUS_LABELS } from './actions.js';
import { planOwners, planSummary } from './actionPlan.js';
import { getLabel } from './lookups.js';
import { requiredByWorkflow, STEP_LABELS, stepStates } from './review.js';
import { causeName, SIX_M_THEMES } from './rootCause.js';
import { assessmentFor, bandLabel, ratingText } from './severity.js';

const PILLARS_WITH_DOCUMENTS = ['pillar-hs', 'pillar-env', 'pillar-ir'];

const formatDate = (iso) =>
  new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// A valid review of a Health & Safety, Environment or Industrial Risk event (SC-1, SC-4).
export function hasAlert(event) {
  return event.status !== 'Draft' && event.review?.decision === 'valid' && PILLARS_WITH_DOCUMENTS.includes(event.pillarId);
}

// The required steps not done yet, or "None — the event is closed." (SC-4).
export function nextSteps(event) {
  const pending = stepStates(event).filter((item) => item.state === 'current' || item.state === 'upcoming');
  if (event.status === 'Closed' || pending.length === 0) return 'None — the event is closed.';
  return pending.map((item) => STEP_LABELS[item.step]).join(' · ');
}

// Anyone with an event role whose access includes the event's plant, whatever their pillars (SC-3).
export function canReadCommunication(user, event) {
  return Boolean(user?.role) && (user.access || []).some((entry) => entry.plantId === event.plantId);
}

// none | draft | published (SC-5, SC-7).
export function warningState(event) {
  if (!hasAlert(event)) return 'none';
  if (event.safetyWarning?.publishedAt) return 'published';
  return event.rca?.completedAt && event.actionPlan?.deployedAt ? 'draft' : 'none';
}

// The draft is the plan owners' only; a published Warning is the plant's (SC-3, SC-5).
export function canSeeWarning(user, event, groups, users) {
  const state = warningState(event);
  if (state === 'published') return canReadCommunication(user, event);
  return state === 'draft' && (planOwners(event, groups, users).includes(user.id) || isPlantSiteAdmin(user, event));
}

// The plan owners and the plant's Site Admins publish the draft (014 SC-7).
export function canPublish(user, event, groups, users) {
  return warningState(event) === 'draft' && (planOwners(event, groups, users).includes(user.id) || isPlantSiteAdmin(user, event));
}

// A rating as a badge "<score> — <band>" in its band's color and its "(<impact> × <duration>)".
function ratingRow(label, matrix, rating) {
  if (!rating) return { label, value: '—' };
  const impact = matrix.impacts.find((item) => item.key === rating.impact).label;
  const duration = matrix.durations.find((item) => item.key === rating.duration).label;
  return {
    label,
    value: ratingText(matrix, rating),
    band: rating.band,
    badge: `${rating.score} — ${bandLabel(rating.band)}`,
    detail: `(${impact} × ${duration})`,
  };
}

function severityRows(event) {
  const assessment = assessmentFor(event);
  const review = event.review;
  const rows = [];
  if (assessment.potential) rows.push(ratingRow(assessment.potentialTitle, assessment.matrix, review.potential));
  if (assessment.actual) rows.push(ratingRow(assessment.actualTitle, assessment.matrix, review.actual));
  if (assessment.flagQuestion) rows.push({ label: assessment.flagQuestion.label, value: review.flagConfirmed ? 'Yes' : 'No' });
  return rows;
}

// The Safety Alert, from the event as it is now (SC-4). lookups = { organization, reference } (the
// platform reference with the form lists, as in the app).
export function alertContent(event, { organization, reference }) {
  const level = reference.find((item) => item.list === 'level' && item.code === event.levelCode);
  return {
    record: event.recordNumber,
    plant: getPlantName(organization, event.plantId),
    pillar: getLabel(reference, event.pillarId),
    pillarId: event.pillarId,
    level: level ? `${level.code} — ${level.label}` : event.levelCode,
    eventDate: formatDate(event.reportDate),
    critical: event.review.criticalFlags?.length ? event.review.criticalFlags.join(' · ') : 'No',
    severity: severityRows(event),
    statement: event.rca?.statement?.trim() || event.review.statement,
    immediateActions: (event.immediateActions || []).map((action) => ({
      description: action.description,
      priority: getLabel(reference, action.priority) || action.priority,
    })),
    nextSteps: nextSteps(event),
  };
}

// The Safety Warning: the Alert's parts but its Next steps, and what the analysis and the plan
// found (SC-5).
export function warningContent(event, lookups, today) {
  const rca = event.rca || {};
  const themeLabel = (key) => SIX_M_THEMES.find((theme) => theme.key === key)?.label ?? key;
  const summary = planSummary(event, today);
  const { nextSteps: _alertOnly, ...alert } = alertContent(event, lookups);
  return {
    ...alert,
    causes: (rca.causes || []).map((cause) => ({ cause: `${themeLabel(cause.theme)} › ${causeName(cause)}`, how: cause.why || '' })),
    rootCauses: (rca.whys || []).filter((why) => why.rootCause && why.answer?.trim()).map((why) => why.answer.trim()),
    learnings: rca.learnings || '',
    actions: (event.actions || []).map((action) => ({
      description: action.description,
      status: ACTION_STATUS_LABELS[action.status] ?? action.status,
      dueDate: action.dueDate ? formatDate(action.dueDate) : '',
    })),
    summary: `${summary.count} action${summary.count === 1 ? '' : 's'} · ${summary.completed} completed · ${summary.overdue} overdue`,
    photoIds: event.safetyWarning?.photoIds || [],
  };
}

// The photos ticked in the draft (SC-6).
export function setWarningPhotos(event, photoIds) {
  const current = event.safetyWarning || { publishedAt: null, publishedBy: null, content: null };
  return { ...event, safetyWarning: { ...current, photoIds } };
}

// Publishing keeps the content as it is now; it no longer changes (SC-7).
export function publishWarning(event, content, userId, now) {
  return { ...event, safetyWarning: { photoIds: content.photoIds, publishedAt: now, publishedBy: userId, content: { ...content, publishedOn: formatDate(now) } } };
}

// The document to show: the Alert, or the Warning (its frozen copy once published).
export function warningToShow(event, lookups, today) {
  return event.safetyWarning?.publishedAt ? event.safetyWarning.content : warningContent(event, lookups, today);
}

const analysisPossible = (event) =>
  Boolean(event.rca?.completedAt) || event.review?.furtherAnalysis === true || requiredByWorkflow(event, 'rootCause');

// Why a document is not there (yet), or null when nothing prevents it.
function blockedReason(event) {
  if (!PILLARS_WITH_DOCUMENTS.includes(event.pillarId)) return 'Not for Industrial Hygiene';
  if (event.status === 'Archived') return 'Not for an archived event';
  return null;
}

// The Communications section of the event's steps menu: each document's state text and whether it
// opens there (SC-10). Returns [{ kind, label, hint, open }].
export function communicationStates(user, event, groups, users) {
  const blocked = blockedReason(event);
  const alert = hasAlert(event)
    ? { hint: 'Available', open: true }
    : { hint: blocked ?? 'After the review', open: false };
  let warning;
  const state = warningState(event);
  if (state === 'published') warning = { hint: 'Published', open: true };
  else if (state === 'draft' && canPublish(user, event, groups, users)) warning = { hint: 'Draft — ready to publish', open: true };
  else if (state === 'draft') warning = { hint: 'Being prepared by the plan owners', open: false };
  else if (blocked) warning = { hint: blocked, open: false };
  else if (event.review?.decision === 'valid' && !analysisPossible(event)) warning = { hint: 'Only after a root cause analysis', open: false };
  else warning = { hint: 'After the analysis and the action plan', open: false };
  return [
    { kind: 'alert', label: 'Safety Alert', ...alert },
    { kind: 'warning', label: 'Safety Warning', ...warning },
  ];
}
