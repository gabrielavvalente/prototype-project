// Root cause analysis (feature 004; Investigation source): 5W1H (optional), 6M, 3-legged 5 Why and
// learnings, who may fill them in, and completing the step.

import { membersOf } from '../../../../shared/platform/groups.js';
import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { currentStep } from './review.js';

// Management replaces the classic Measurement on purpose (Investigation source).
export const THEMES = ['Man', 'Machine', 'Method', 'Materials', 'Mother Nature', 'Management'];
export const MAX_CAUSES = 6;
export const MAX_WHYS = 5;
export const ROOT_CAUSE_TYPES = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'conditional', label: 'Conditional' },
];
export const FIVE_W1H = [
  { key: 'who', label: 'Who', question: 'Who was involved or affected?' },
  { key: 'what', label: 'What', question: 'What happened, step by step?' },
  { key: 'when', label: 'When', question: 'When did it happen, and during which activity?' },
  { key: 'where', label: 'Where', question: 'Where exactly did it happen?' },
  { key: 'why', label: 'Why', question: 'Why did it happen at that moment?' },
  { key: 'how', label: 'How', question: 'How did it happen?' },
];

export function newWhy() {
  return { id: crypto.randomUUID(), answer: '', rootCause: null };
}

export function newLeg() {
  return { id: crypto.randomUUID(), whys: [newWhy()] };
}

// A new analysis, pre-filled from the review's statement and the submission's immediate actions.
export function emptyAnalysis(event) {
  const actions = event.immediateActions.map((action) => action.description).filter(Boolean);
  return {
    statement: event.review?.statement || event.description || '',
    immediateActions: actions.length > 0 ? actions.join('\n') : 'None recorded.',
    fiveW1H: Object.fromEntries(FIVE_W1H.map((section) => [section.key, { applies: null, answer: '' }])),
    causes: [],
    legs: [newLeg()],
    learnings: '',
    completedBy: null,
    completedAt: null,
  };
}

const filled = (text) => Boolean((text || '').trim());

function fiveW1HStatus(fiveW1H) {
  const sections = Object.values(fiveW1H);
  if (sections.every((section) => section.applies === null)) return 'notStarted';
  const answered = (section) => section.applies === false || (section.applies === true && filled(section.answer));
  return sections.every(answered) ? 'done' : 'inProgress';
}

function sixMStatus(causes) {
  if (causes.length === 0) return 'notStarted';
  return causes.every((cause) => filled(cause.cause) && filled(cause.why)) ? 'done' : 'inProgress';
}

function fiveWhyStatus(legs) {
  const whys = legs.flatMap((leg) => leg.whys);
  if (!whys.some((why) => filled(why.answer))) return 'notStarted';
  const marked = whys.filter((why) => why.rootCause);
  const classified = (why) => ['behavioral', 'conditional'].includes(why.rootCause) && filled(why.answer);
  return marked.length > 0 && marked.every(classified) ? 'done' : 'inProgress';
}

// notStarted | inProgress | done for each part (5W1H is optional).
export function partStatus(analysis) {
  return {
    fiveW1H: fiveW1HStatus(analysis.fiveW1H),
    sixM: sixMStatus(analysis.causes),
    fiveWhy: fiveWhyStatus(analysis.legs),
    learnings: filled(analysis.learnings) ? 'done' : 'notStarted',
  };
}

// What is missing before the analysis can be completed, as { part: message }.
export function validateAnalysis(analysis) {
  const status = partStatus(analysis);
  const errors = {};
  if (status.sixM !== 'done') errors.sixM = 'Add at least one cause, each with why it was a possible cause.';
  if (status.fiveWhy !== 'done') errors.fiveWhy = 'Mark at least one answer as a root cause and classify every root cause.';
  if (status.learnings !== 'done') errors.learnings = 'Write the learnings.';
  return errors;
}

// Completing moves the event like the review: next required step (In Progress) or Closed.
export function completeAnalysis(event, analysis, userId, now) {
  const done = { ...event, rca: { ...analysis, savedBy: userId, savedAt: now, completedBy: userId, completedAt: now } };
  const next = currentStep({ ...done, status: 'In Progress' });
  return next ? { ...done, status: 'In Progress' } : { ...done, status: 'Closed', closedAt: now };
}

// The designated users and the members of the designated groups.
function designatedIds(event, groups) {
  const assignees = event.review?.rcaAssignees;
  if (!assignees) return [];
  return [...new Set([...assignees.userIds, ...membersOf(groups, assignees.groupIds)])];
}

// Who may fill the analysis in: the designated people while it is the current step; the reviewer
// when nobody was designated (events reviewed before feature 004).
export function canPerformAnalysis(user, event, groups) {
  if (currentStep(event) !== 'rootCause') return false;
  const ids = designatedIds(event, groups);
  return ids.length > 0 ? ids.includes(user.id) : event.review?.reviewerId === user.id;
}

// Who gets "Root cause analysis assigned to you": designated users and group members who can see
// the event, once each, never the reviewer.
export function assigneeIds(event, groups, users) {
  const canSee = (id) => {
    const person = users.find((user) => user.id === id);
    return Boolean(person) && getPillarIdsForPlant(person, event.plantId).includes(event.pillarId);
  };
  return designatedIds(event, groups).filter((id) => id !== event.review?.reviewerId && canSee(id));
}
