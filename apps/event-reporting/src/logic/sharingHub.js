// The Event Sharing Hub (feature 009): sharing a published Safety Warning with other plants, and
// each receiving plant's local check. Shares and checks are kept on the event (research R1).

import { classificationValueName, getList } from '../../../../shared/platform/masterData.js';
import { getPlants } from '../../../../shared/platform/organization.js';
import { planOwners } from './actionPlan.js';
import { warningState } from './safetyCommunication.js';

const MAX_ASSIGNEES = 5;
const FINAL = ['completed', 'cancelled'];

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const hasAccessTo = (user, plantId) => (user?.access || []).some((entry) => entry.plantId === plantId);

export const CHECK_STATE_LABELS = {
  notChecked: 'Not checked',
  beingChecked: 'Being checked',
  yes: 'Could happen here',
  closedYes: 'Could happen here — closed',
  no: 'Could not happen here',
};

// A closed case: read-only, in the Sharing Hub's History (SH-5, SH-8).
export function isClosed(check) {
  return check.state === 'closedYes' || check.state === 'no';
}

// The plan owners, the event's reviewer and the Site Admins of the event's plant, once the Warning is
// published (SH-1).
export function canShare(user, event, groups, users) {
  if (warningState(event) !== 'published') return false;
  return (
    planOwners(event, groups, users).includes(user.id) ||
    event.review?.reviewerId === user.id ||
    (user.role === 'Site Admin' && hasAccessTo(user, event.plantId))
  );
}

// A plant matches every chosen region, country and business; the chosen plants are added; never
// the event's own plant (SH-2, research R4). Returns the plants, in the organization's order.
export function reachPlants(organization, { regions = [], countries = [], businesses = [], plantIds = [] }, originPlantId) {
  const plants = getPlants(organization);
  const byCriteria = regions.length || countries.length || businesses.length;
  const matched = byCriteria
    ? plants.filter(
        (plant) =>
          (!regions.length || regions.includes(plant.region)) &&
          (!countries.length || countries.includes(plant.countryName)) &&
          (!businesses.length || businesses.includes(plant.parentId)),
      )
    : [];
  const ids = new Set([...matched.map((plant) => plant.id), ...plantIds]);
  ids.delete(originPlantId);
  return plants.filter((plant) => ids.has(plant.id));
}

// The plants every share of the event reached.
export function sharedPlantIds(event) {
  return [...new Set((event.hubShares || []).flatMap((share) => share.plantIds))];
}

const PARTS = [
  ['What happened', (content) => content.statement],
  ['What was done', (content) => content.immediateActions.map((action) => action.description).join(' ')],
  ['Contributory causes', (content) => content.causes.map((cause) => `${cause.cause} ${cause.how}`).join(' ')],
  ['Root causes', (content) => content.rootCauses.join(' ')],
  ['Corrective actions', (content) => content.actions.map((action) => action.description).join(' ')],
  ['Key learnings', (content) => content.learnings],
];

// The full names a package must not contain: every person of the platform and the event's person
// involved (SH-3, research R3).
export function namesToHide(event, users) {
  return [...users.map((user) => user.name), event.involvedPersonName].filter((name) => (name || '').trim());
}

// The parts of a Warning's content that contain one of the names, ignoring case (SH-3).
export function namedParts(content, names) {
  const lowered = names.map((name) => name.trim().toLowerCase());
  return PARTS.filter(([, text]) => lowered.some((name) => (text(content) || '').toLowerCase().includes(name))).map(([part]) => part);
}

// The review's classification values by list name, from the master data values (SH-4).
export function classificationNames(event, values) {
  return Object.entries(event.review?.classification || {})
    .filter(([, ids]) => ids?.length)
    .map(([listId, ids]) => ({
      list: getList(listId)?.label ?? listId,
      // An injury chosen for a body part reads "Ear: Bruise" (012 RV-6).
      values: ids.map((id) => classificationValueName(values, id)).filter(Boolean),
    }));
}

// The frozen package: the published Warning's content and the classification names (SH-4).
export function buildPackage(event, classification) {
  return { content: event.safetyWarning.content, classification };
}

// A share reaching the plants not reached yet; the first package is kept (SH-2, SH-4).
// Returns { event, plantIds } (the plants newly reached).
export function shareWarning(event, { plantIds, pkg, userId, now }) {
  const already = sharedPlantIds(event);
  const reached = plantIds.filter((id) => !already.includes(id));
  if (reached.length === 0) return { event, plantIds: [] };
  const share = { id: crypto.randomUUID(), at: now, by: userId, plantIds: reached, package: event.hubShares?.[0]?.package ?? pkg };
  return { event: { ...event, hubShares: [...(event.hubShares || []), share] }, plantIds: reached };
}

// "Shared with Porto, Curitiba on 26 Oct 2026", one per share (SH-4).
export function sharedLines(event, organization) {
  const name = (id) => organization.find((node) => node.id === id)?.name ?? id;
  return (event.hubShares || []).map((share) => `Shared with ${share.plantIds.map(name).join(', ')} on ${formatDate(share.at)}`);
}

export function checkOf(event, plantId) {
  return event.hubChecks?.[plantId] ?? { state: 'notChecked', answer: null, actions: [], history: [] };
}

// The packages shared with a plant, newest first: [{ event, pkg, receivedAt, state }] (SH-5).
export function receivedPackages(events, plantId) {
  return events
    .map((event) => {
      const share = (event.hubShares || []).find((item) => item.plantIds.includes(plantId));
      const check = checkOf(event, plantId);
      return share ? { event, pkg: share.package, receivedAt: share.at, state: check.state, closedAt: check.closedAt ?? null } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

// The receiving plant's Site Admins and Managers run its check (SH-7).
export function canCheck(user, plantId) {
  return ['Site Admin', 'Manager'].includes(user?.role) && hasAccessTo(user, plantId);
}

function withCheck(event, plantId, check) {
  return { ...event, hubChecks: { ...(event.hubChecks || {}), [plantId]: check } };
}

// Verify locally: "Being checked", with no action yet (SH-7).
export function startCheck(event, plantId, user, now) {
  return withCheck(event, plantId, { state: 'beingChecked', answer: null, actions: [], history: [{ at: now, text: `Check started by ${user.name}` }] });
}

// What is missing in a local action, as { field: message } (SH-7).
export function validateLocalAction(action) {
  const errors = {};
  if (!action.description?.trim()) errors.description = 'Describe the action.';
  if (!action.assigneeIds?.length || action.assigneeIds.length > MAX_ASSIGNEES) errors.assigneeIds = `Choose 1 to ${MAX_ASSIGNEES} assignees.`;
  if (!action.dueDate) errors.dueDate = 'Choose a due date.';
  return errors;
}

// Adds a local action (On Going) or saves changes to one (SH-7).
export function saveLocalAction(event, plantId, action) {
  const check = checkOf(event, plantId);
  const exists = check.actions.some((item) => item.id === action.id);
  const saved = exists ? action : { ...action, id: action.id || crypto.randomUUID(), status: 'onGoing' };
  const actions = exists ? check.actions.map((item) => (item.id === action.id ? saved : item)) : [...check.actions, saved];
  return withCheck(event, plantId, { ...check, actions });
}

// The statuses the user may give a local action: the assignee completes their own, the checkers
// cancel; a finished action no longer changes (SH-7).
export function allowedLocalStatuses(user, action, plantId) {
  if (FINAL.includes(action.status)) return [];
  const next = [];
  if (action.assigneeIds.includes(user.id)) next.push('completed');
  if (canCheck(user, plantId)) next.push('cancelled');
  return next;
}

export function setLocalActionStatus(event, plantId, actionId, status, user, now) {
  const check = checkOf(event, plantId);
  const action = check.actions.find((item) => item.id === actionId);
  const actions = check.actions.map((item) => (item.id === actionId ? { ...item, status, statusBy: user.id, statusAt: now } : item));
  const history = status === 'completed' ? [...check.history, { at: now, text: `${action.description} completed by ${user.name}` }] : check.history;
  return withCheck(event, plantId, { ...check, actions, history });
}

// Why the case cannot be closed yet, or null: an action is still On Going (SH-8).
export function closingProblem(check) {
  return check.actions.some((action) => !FINAL.includes(action.status)) ? 'Finish or cancel every action first.' : null;
}

function withHistory(event, plantId, changes, text, now) {
  const check = checkOf(event, plantId);
  return withCheck(event, plantId, { ...check, ...changes, history: [...check.history, { at: now, text }] });
}

// Yes: the case stays open for as many actions as needed (SH-8).
export function answerYes(event, plantId, user, now) {
  return withHistory(event, plantId, { state: 'yes', answer: true }, `Could happen here — answered by ${user.name}`, now);
}

// No: the case is closed at once (SH-8).
export function answerNo(event, plantId, user, now) {
  return withHistory(event, plantId, { state: 'no', answer: false, closedAt: now }, `Check completed by ${user.name}: could not happen here`, now);
}

// Close case, after Yes (SH-8).
export function closeCase(event, plantId, user, now) {
  return withHistory(event, plantId, { state: 'closedYes', closedAt: now }, `Case closed by ${user.name}`, now);
}

// The package's history at the plant, oldest first (SH-9).
export function historyOf(event, plantId) {
  const share = (event.hubShares || []).find((item) => item.plantIds.includes(plantId));
  const received = share ? [{ at: share.at, text: `Received on ${formatDate(share.at)}` }] : [];
  return [...received, ...checkOf(event, plantId).history];
}
