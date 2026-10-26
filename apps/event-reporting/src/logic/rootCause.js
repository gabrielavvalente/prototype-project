// Root cause analysis (feature 004; Investigation source and UI/UX designs): 5W1H (optional), 6M,
// 5 Why and learnings, who may fill them in, and completing the step.

import { membersOf } from '../../../../shared/platform/groups.js';
import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { currentStep } from './review.js';

export const MAX_CAUSES = 6;
export const MAX_WHYS = 5;

const questions = (key, items) => items.map(([text, hint], index) => ({ id: `${key}-${index + 1}`, text, hint }));

// 5W1H sections and questions, from the Analysis Checklist (006; obvious typos and cut-off
// sentences fixed). A section with onlyPillarIds is offered only for events of those pillars.
export const FIVE_W1H = [
  {
    key: 'who',
    label: 'Who was injured?',
    onlyPillarIds: ['pillar-hs'],
    questions: questions('who', [
      ['Name'],
      ['Age'],
      ['Length of service'],
      ['Experience/training'],
      ['Occupation'],
      ['Who else was involved?', 'Other victims, witnesses, contractors, colleagues, public'],
      ['Obtain statements from witnesses/other victims', 'List document references'],
    ]),
  },
  {
    key: 'what',
    label: 'What happened?',
    questions: questions('what', [
      ['What are the details of the event?', 'Brief description'],
      ['What were working environment conditions?', 'Lighting, inside/outside work, temperature, climate conditions: wind, snow, rain'],
      ['Summary of injury and how sustained'],
      ['Details of work activity carried out'],
      ['What was being done immediately before and also 10 minutes before the event?'],
      ['Who was the direct supervisor at the time of the incident?'],
      ["What was the victim's supervisor doing at the time of the event and 10 minutes beforehand?"],
      ['What other events or people were in the area at the time of the incident? Anything unusual about the working condition?'],
      ['What applicable standard procedures and/or instructions were in place for the operations being undertaken around the event?', 'Risk assessments, method statements, etc.'],
      ["What communications had been given by the victim's supervisor that were relevant to the work being carried out?"],
      ['What is the process for approval of method statements or SOPs in this particular work?'],
      ['What qualifications or experience did the author have who prepared Permits to work or method statements?'],
      ['What other hazards contributed to the event?'],
    ]),
  },
  {
    key: 'when',
    label: 'When?',
    questions: questions('when', [
      ['When did the event occur?', 'Date and time'],
      ['When was the victim asked to perform the job/task/activity undertaken?'],
      ['When was the last review of the risk assessment or SOP?'],
      ['When was the last record of any site/work/plant inspection?'],
      ['When and to whom was the event reported?', 'Refer to witness reports'],
      ['When were emergency procedures/actions implemented?', 'Refer to witness reports and official reports'],
    ]),
  },
  {
    key: 'where',
    label: 'Where?',
    questions: questions('where', [
      ['Did the event occur within the site boundaries? If not, give details of the incident origin'],
      ['Where did the event occur? What other parts of the site were affected by the event?'],
      ['Where was the victim positioned/located at the time of the event?'],
      ['Where were the witnesses/other victims located at the time of the event?'],
    ]),
  },
  {
    key: 'why',
    label: 'Why did the event occur?',
    questions: questions('why', [
      ['Comment'],
      ['Has this event occurred or almost occurred previously on the site or in the company?', 'Review all site records for near misses, event reports and SHEAR warnings to determine any trends'],
      ['Were there any previously identified hazards omitted from the risk assessments or SOPs?'],
      ['Is there any reason why the hazards now identified were not part of the risk assessment?'],
      ['Why was the injured person close to the hazard?'],
      ['Did the victim carry out any unsafe or poor CHEAR behaviours? Why?'],
      ['Any other relevant information', 'E.g. breakdown in communication, lack of signage, fatigue, ill health, production pressures'],
    ]),
  },
  {
    key: 'how',
    label: 'How did the event occur?',
    questions: questions('how', [
      ['Review the documentation'],
      ['A flow diagram may be useful to identify key gaps or critical points'],
      ['Have you received the witness reports?'],
      ['Were work activity procedures followed?'],
      ['How did any new hazards get updated into the assessment of SOPs?'],
      ['How was the emergency response for the event managed?', 'Details of emergency procedures/actions'],
      ['Have the witness statements and/or other reports highlighted any contributing factors? If yes, explain'],
    ]),
  },
];

// 6M themes, failure causes and guidance, from the 6M document (006; keys kept so saved analyses
// stay readable).
export const SIX_M_THEMES = [
  {
    key: 'management',
    label: 'Management',
    causes: ['Organization of Work', 'Lack of Supervision', 'Non-application of standards/procedures', 'Communication / information problem', 'Working long hours', 'Lack of Resources', 'Training'],
    guidance: ['Is the work organized?', 'Are the resources adequate?', 'Are rules and procedures communicated and maintained?', 'Has the staff been trained or informed?', 'Are the staff supervised effectively?'],
  },
  {
    key: 'humanFactors',
    label: 'Man Power',
    causes: ['Short cut', 'Fatigue', 'Mind/eye not on the task', 'Bad habit/over-confidence', 'Distraction', 'In the line of fire', 'Loss of balance, traction or grip', 'Not applying standards or procedures', 'Lack of skills or knowledge', 'Negligence', 'Manual handling/ergonomics', 'Not aware of hazard/consequences', 'Mistake/error'],
    guidance: ['Is communication (information, training, warning) available and sufficient?', 'Is competence tested and validated?', 'Is behaviour monitored?', 'Are operators coached (skill, behaviour, attitude)?', 'Is there evidence of praise or discipline used?', 'Is medical or HR advice required?', 'Is specialist health and safety advice required?'],
  },
  {
    key: 'methods',
    label: 'Methods',
    causes: ['No written procedure', 'Inadequate procedure', 'Contractor control', 'Work permit', 'Inadequate emergency procedure', 'Procedure not applied', 'LOTO', 'Management of change', 'Seconds to think'],
    guidance: ['Is the procedure suitable and sufficient?', 'Did the risk assessment identify the hazard?', 'Was a pre-start risk assessment done?', 'Were all requirements of legal and company standards in place?', 'Were procedures followed?'],
  },
  {
    key: 'machine',
    label: 'Machines/Tools/Equipment',
    causes: ['Unsafe equipment', 'Poor maintenance', 'Operating ergonomics', 'Machine condition', 'Building condition', 'PPE not suitable', 'Unsuitable tools', 'Tools not available', 'PPE not available'],
    guidance: ['Consider the condition of materials, equipment, facilities, buildings, tools, PPE and storage.', 'What system is in place for checking?'],
  },
  {
    key: 'materials',
    label: 'Materials',
    causes: ['Hazardous substances', 'Explosive dust/vapours', 'Contact with energy source', 'Shape, size, weight', 'Raw materials', 'Materials containment'],
    guidance: ['Are controls in place to prevent exposure to hazardous materials or energy sources?', 'Are materials and products stored in a safe condition?', 'Are the materials or products in an abnormal condition?'],
  },
  {
    key: 'environment',
    label: 'Environment',
    causes: ['Confined space', 'Storage conditions', 'Warning devices', 'Lighting', 'Noise', 'Excessive heat or cold', 'Fumes, smoke, dust', 'Climatic conditions', 'Humidity', 'Work at height'],
    guidance: ['Did the climatic or workplace conditions cause or contribute to the cause of the incident?'],
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

// The 5W1H sections offered for an event's pillar ("Who was injured?" for Health & Safety only).
export function fiveW1HSections(pillarId) {
  return FIVE_W1H.filter((section) => !section.onlyPillarIds || section.onlyPillarIds.includes(pillarId));
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

// The designated users and the members of the designated groups (also the action plan's owners,
// 005 AP-2).
export function designatedIds(event, groups) {
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
