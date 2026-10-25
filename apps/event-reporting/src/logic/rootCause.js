// Root cause analysis (feature 004; Investigation source and UI/UX designs): 5W1H (optional), 6M,
// 5 Why and learnings, who may fill them in, and completing the step.

import { membersOf } from '../../../../shared/platform/groups.js';
import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { currentStep } from './review.js';

export const MAX_CAUSES = 6;
export const MAX_WHYS = 5;

const questions = (key, items) => items.map(([text, hint], index) => ({ id: `${key}-${index + 1}`, text, hint }));

// 5W1H sections and questions (ui-ux/5w1h.png). Only "What happened?" comes from the design; the
// other questions are drafts until the user provides them (spec Clarifications). A section with
// skipPillarIds is not offered for events of those pillars.
export const FIVE_W1H = [
  {
    key: 'who',
    label: 'Who was injured?',
    skipPillarIds: ['pillar-env'],
    questions: questions('who', [
      ['Who was injured or involved?', 'Job title and company: employee, contractor or visitor'],
      ['How long has the person been in this job and at this site?'],
      ['What training and qualifications did the person have for the task?'],
      ['Who witnessed the event?'],
      ['Who was in charge of the work?'],
    ]),
  },
  {
    key: 'what',
    label: 'What happened?',
    questions: questions('what', [
      ['What are the details of the event?', 'Brief description'],
      ['What were working environment conditions?', 'i.e. lighting, inside/outside work, temperature, climate conditions (wind, snow, rain)'],
      ['Summary of injury and how sustained'],
      ['Details of work activity carried out.'],
      ['What was being done immediately before and also 10 minutes before the incident?'],
      ['Who was the direct supervisor at the time of the incident?'],
      ["What was the victim's supervisor doing at the time of the event and 10 minutes beforehand?"],
      ['What other events or persons were in the area at the time of the incident? Anything unusual about the working condition?'],
      ['What applicable standard procedures and/or instructions were in place for the operations being undertaken around the incident?', 'Risk assessments, method statements etc.'],
      ["What communications had been given by the victim's supervisor that were relevant to work being carried out?"],
      ['What is the process for approval of method statements or SOPs in this particular work?'],
      ['What qualifications or experience did the author have who prepared Permits to work or method statements?'],
      ['What other hazards contributed to the event?'],
    ]),
  },
  {
    key: 'when',
    label: 'When?',
    questions: questions('when', [
      ['On which date and at what time did the event happen?'],
      ['How many hours into the shift did it happen?'],
      ['During which phase of the task or of production did it happen?'],
      ['When was the event reported, and to whom?'],
    ]),
  },
  {
    key: 'where',
    label: 'Where?',
    questions: questions('where', [
      ['Where exactly did the event happen?', 'Building, line, equipment'],
      ['What were the conditions of the area?', 'Access, layout, housekeeping'],
      ['Was the area restricted or marked?'],
      ['Is this the usual place for this task?'],
    ]),
  },
  {
    key: 'why',
    label: 'Why did the event occur?',
    questions: questions('why', [
      ['What were the direct causes of the event?'],
      ['Were there earlier signs or similar events?'],
      ['Why were the existing controls not effective?'],
      ['Were the people doing the work under pressure?', 'Time, production, cost'],
    ]),
  },
  {
    key: 'how',
    label: 'How did the event occur?',
    questions: questions('how', [
      ['How did the event unfold, step by step?'],
      ['How was the injury or damage caused?', 'Contact, energy, movement'],
      ['How was the situation made safe afterwards?'],
      ['How could the event have been prevented?'],
    ]),
  },
];

// 6M themes, contributory causes and guidance (ui-ux/6m.png). Only Management comes from the
// design; the other themes are drafts to be reviewed (spec Clarifications).
export const SIX_M_THEMES = [
  {
    key: 'management',
    label: 'Management',
    causes: ['Communication Problem', 'Information Problem', 'Lack of Resources', 'Lack of Supervision', 'Non-Application of Standards/Procedures', 'Organization of Work', 'Training', 'Working Long Hours'],
    guidance: ['Is the work organized?', 'Are the resources adequate?', 'Are rules and procedures communicated and maintained?', 'Have the staff been trained and informed?', 'Are the staff supervised effectively?'],
  },
  {
    key: 'humanFactors',
    label: 'Human Factors',
    causes: ['Distraction / Inattention', 'Fatigue', 'Inadequate Risk Perception', 'Lack of Knowledge or Skill', 'Non-Use of PPE', 'Physical Capability', 'Rushing / Shortcut', 'Stress / Workload'],
    guidance: ['Was the person fit for the task?', 'Did they know the task and its risks?', 'Were they under time pressure or distracted?', 'Was the right PPE worn?'],
  },
  {
    key: 'methods',
    label: 'Methods',
    causes: ['Inadequate Change Management', 'Inadequate Risk Assessment', 'Permit to Work Not Applied', 'Poor Work Sequence', 'Procedure Missing', 'Procedure Not Adapted to the Task', 'Procedure Unclear or Outdated'],
    guidance: ['Is there a procedure for this task?', 'Is it up to date and adapted to the task?', 'Was the risk assessed before the work?', 'Were changes to the task managed?'],
  },
  {
    key: 'machine',
    label: 'Machine / Tools & Equip.',
    causes: ['Defective Tool', 'Design / Ergonomics Problem', 'Equipment Failure', 'Inadequate Guarding', 'Inadequate Maintenance', 'Missing Safety Device', 'Wrong Tool for the Task'],
    guidance: ['Was the equipment suitable for the task?', 'Was it maintained and inspected?', 'Were guards and safety devices in place and working?'],
  },
  {
    key: 'materials',
    label: 'Materials',
    causes: ['Defective Material', 'Hazardous Substance', 'Inadequate Labelling', 'Inadequate Packaging', 'Inadequate Storage', 'Supplier Quality Problem', 'Wrong Material'],
    guidance: ['Were the materials the right ones and in good condition?', 'Were hazardous substances identified and labelled?', 'Were they stored and handled correctly?'],
  },
  {
    key: 'environment',
    label: 'Environment',
    causes: ['Noise', 'Poor Housekeeping', 'Poor Lighting', 'Poor Ventilation', 'Restricted Space / Access', 'Slippery or Uneven Surface', 'Temperature / Weather'],
    guidance: ['Was the work area clean and tidy?', 'Were lighting, noise and temperature suitable?', 'Was there enough space to work safely?', 'Did the weather play a part?'],
  },
];
export const OTHER_CAUSE = 'Other';

// The name of a ticked cause: the option, or the name given to Other.
export function causeName(cause) {
  return cause.option === OTHER_CAUSE ? (cause.other || '').trim() || OTHER_CAUSE : cause.option;
}

// The 5 Why whys form a tree in a flat list under the 6M causes: a first why's parentId is the id
// of its cause, the others' the id of the why above; siblings keep their order in the list.
export function newWhy(parentId) {
  return { id: crypto.randomUUID(), parentId, answer: '', rootCause: false };
}

export function childrenOf(whys, parentId) {
  return whys.filter((why) => why.parentId === parentId);
}

// 1 for a first why (right under its cause).
export function whyDepth(whys, why) {
  let depth = 1;
  for (let parent = whys.find((item) => item.id === why.parentId); parent; parent = whys.find((item) => item.id === parent.parentId)) {
    depth += 1;
  }
  return depth;
}

// The why and every why below it.
export function subtreeIds(whys, id) {
  return [id, ...childrenOf(whys, id).flatMap((child) => subtreeIds(whys, child.id))];
}

// Adds the next why under a why.
export function addWhyBelow(whys, parentId) {
  return [...whys, newWhy(parentId)];
}

// Adds an alternative answer beside a why (same question), right after it and its whys.
export function branchWhy(whys, id) {
  const why = whys.find((item) => item.id === id);
  const lastIndex = Math.max(...subtreeIds(whys, id).map((item) => whys.findIndex((w) => w.id === item)));
  return [...whys.slice(0, lastIndex + 1), newWhy(why.parentId), ...whys.slice(lastIndex + 1)];
}

const isFirstWhy = (whys, why) => !whys.some((item) => item.id === why.parentId);

// Removes a why with the whys below it, never the only first why of a cause.
export function removeWhy(whys, id) {
  const why = whys.find((item) => item.id === id);
  if (isFirstWhy(whys, why) && childrenOf(whys, why.parentId).length === 1) return whys;
  const removed = subtreeIds(whys, id);
  return whys.filter((item) => !removed.includes(item.id));
}

// Keeps the whys in line with the 6M causes: each cause gets a first why, and the whys of causes
// no longer ticked are dropped (004 FR-010).
export function syncWhysWithCauses(whys, causes) {
  const kept = causes.flatMap((cause) => childrenOf(whys, cause.id).flatMap((why) => subtreeIds(whys, why.id)));
  const result = whys.filter((why) => kept.includes(why.id));
  const missing = causes.filter((cause) => childrenOf(result, cause.id).length === 0).map((cause) => newWhy(cause.id));
  return [...result, ...missing];
}

// 5 Why opens once 6M is done (004 FR-010).
export function canDoFiveWhy(analysis) {
  return sixMStatus(analysis.causes) === 'done';
}

// The 5W1H sections offered for an event's pillar (no "Who was injured?" for Environment).
export function fiveW1HSections(pillarId) {
  return FIVE_W1H.filter((section) => !section.skipPillarIds?.includes(pillarId));
}

function emptyFiveW1H() {
  return Object.fromEntries(FIVE_W1H.map((section) => [section.key, { applies: null, answers: {} }]));
}

// A new analysis, pre-filled from the review's statement. The immediate actions are the
// submission's own (event.immediateActions), edited from the step.
export function emptyAnalysis(event) {
  return {
    statement: event.review?.statement || event.description || '',
    fiveW1H: emptyFiveW1H(),
    causes: [],
    whys: [],
    learnings: '',
    completedBy: null,
    completedAt: null,
  };
}

// Converts an analysis saved before the remarks of 2026-10-25 (legs, one 5W1H answer per section,
// free-text causes, whys not under a cause, Behavioral / Conditional root causes) to the current
// shape.
export function normalizeAnalysis(analysis) {
  const rest = { ...analysis };
  // The legs become chains of whys; the immediate actions text is now the submission's own list.
  delete rest.legs;
  delete rest.immediateActions;
  const chain = (leg) => leg.whys.map((why, index) => ({ ...why, parentId: index === 0 ? null : leg.whys[index - 1].id }));
  const loose = rest.whys ?? (analysis.legs ?? []).flatMap(chain);
  const fiveW1H = Object.fromEntries(
    FIVE_W1H.map((section) => {
      const saved = rest.fiveW1H?.[section.key] ?? {};
      const answers = saved.answers ?? (saved.answer ? { [section.questions[0].id]: saved.answer } : {});
      return [section.key, { applies: saved.applies ?? null, answers }];
    }),
  );
  const themeKeys = SIX_M_THEMES.map((theme) => theme.key);
  const causes = (rest.causes ?? []).map((cause) =>
    cause.option
      ? cause
      : { id: cause.id, theme: themeKeys.includes(cause.theme) ? cause.theme : 'management', option: OTHER_CAUSE, other: cause.cause, why: cause.why },
  );
  // Whys saved without a cause go under the first cause.
  const whys = loose.map((why) => ({
    ...why,
    parentId: why.parentId ?? causes[0]?.id,
    rootCause: Boolean(why.rootCause),
  }));
  return { ...rest, fiveW1H, causes, whys: syncWhysWithCauses(whys, causes) };
}

const filled = (text) => Boolean((text || '').trim());

function fiveW1HStatus(fiveW1H, pillarId) {
  const sections = fiveW1HSections(pillarId).map((section) => ({ section, value: fiveW1H[section.key] }));
  if (sections.every(({ value }) => value.applies === null)) return 'notStarted';
  const answered = ({ section, value }) =>
    value.applies === false || (value.applies === true && section.questions.every((question) => filled(value.answers[question.id])));
  return sections.every(answered) ? 'done' : 'inProgress';
}

const explained = (cause) => filled(cause.why) && (cause.option !== OTHER_CAUSE || filled(cause.other));

function sixMStatus(causes) {
  if (causes.length === 0) return 'notStarted';
  return causes.every(explained) ? 'done' : 'inProgress';
}

// Done when at least one why is a root cause and every root cause has its answer.
function fiveWhyStatus(whys) {
  if (!whys.some((why) => filled(why.answer))) return 'notStarted';
  const marked = whys.filter((why) => why.rootCause);
  return marked.length > 0 && marked.every((why) => filled(why.answer)) ? 'done' : 'inProgress';
}

// notStarted | inProgress | done for each part (5W1H is optional and depends on the event's pillar).
export function partStatus(analysis, pillarId) {
  return {
    fiveW1H: fiveW1HStatus(analysis.fiveW1H, pillarId),
    sixM: sixMStatus(analysis.causes),
    fiveWhy: fiveWhyStatus(analysis.whys),
    learnings: filled(analysis.learnings) ? 'done' : 'notStarted',
  };
}

// What is missing before the analysis can be completed, as { part: message }.
export function validateAnalysis(analysis) {
  const status = partStatus(analysis);
  const errors = {};
  if (status.sixM !== 'done') errors.sixM = 'Tick at least one contributory cause and explain how each one contributed.';
  if (status.fiveWhy !== 'done') errors.fiveWhy = 'Mark at least one answered why as a root cause; every root cause needs its answer.';
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
