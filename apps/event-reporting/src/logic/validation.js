// Mandatory-field and file rules for the event form (data-model.md, "Validation rules summary").
// Every function returns plain data so it can be tested without the screens.

import { toDateString, toTimeString } from './lookups.js';

export const SECTIONS = ['classification', 'location', 'general', 'details', 'actions'];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_FILES = 5;
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_PERFORMERS = 5;

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'mp4', 'mov', 'webm'];
export const LOCATION_LEVELS = ['departmentId', 'workshopId', 'jobId', 'workstationId', 'taskId'];

// The "Employee" employee type: the person involved is then chosen among the plant's users.
export const EMPLOYEE_TYPE_EMPLOYEE = 'employeeType-1';

// The "Other" first aid treatment, which asks for a description (review 2026-10-25).
export const FIRST_AID_OTHER = 'firstAidTreatment-9';

// Near misses and hazardous situations only need the area (FR-005, safety event rules).
const AREA_ONLY_LEVELS = ['TF4', 'TF5'];

export function getRequiredLocationLevels(levelCode) {
  return AREA_ONLY_LEVELS.includes(levelCode) ? ['departmentId', 'workshopId'] : LOCATION_LEVELS;
}

export function isTaskTypeRequired(levelCode) {
  return !AREA_ONLY_LEVELS.includes(levelCode);
}

export function isFirstAidRequired(levelCode) {
  return ['TF1', 'TF2', 'TF3'].includes(levelCode);
}

// A hazardous situation (TF5) with serious incident potential is reported as a near miss (TF4)
// (FR-048). Returns the level to use and whether it was changed.
export function applySipLevelRule(levelCode, riskQuestion) {
  const isSip = Boolean(riskQuestion && riskQuestion.type === 'SIP' && riskQuestion.answer === true);
  if (levelCode === 'TF5' && isSip) {
    return { levelCode: 'TF4', changed: true };
  }
  return { levelCode, changed: false };
}

// The follow-up question after the level (FR-004): SIP for Safety and Environment,
// CRP for SRE1–SRE2 and SRP for SRE3–SRE5; none for Occupational Health.
export function getRiskQuestionType(familyCode, levelCode) {
  if (!levelCode) {
    return null;
  }
  if (familyCode === 'TF' || familyCode === 'EVE') {
    return 'SIP';
  }
  if (familyCode === 'SRE') {
    return ['SRE1', 'SRE2'].includes(levelCode) ? 'CRP' : 'SRP';
  }
  return null;
}

// Returns an error message, or null when the file can be attached.
export function validateFile(file, currentCount) {
  if (currentCount >= MAX_FILES) {
    return `You can attach at most ${MAX_FILES} files.`;
  }
  const extension = file.name.split('.').pop().toLowerCase();
  const isMedia = file.type.startsWith('image/') || file.type.startsWith('video/');
  if (!isMedia || !ALLOWED_EXTENSIONS.includes(extension)) {
    return `"${file.name}" is not allowed. Only photos and videos can be attached.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" is larger than 5 MB.`;
  }
  return null;
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function error(field, message) {
  return { field, message };
}

// The category follows the event's pillar and the completion date is the report date, both set
// when the event is saved (review 2026-10-25), so only these fields are asked.
export function validateImmediateAction(action) {
  const errors = [];
  if (isBlank(action.description)) errors.push(error('description', 'Describe the action.'));
  if (isBlank(action.priority)) errors.push(error('priority', 'Choose a priority.'));
  const performers = action.performedByIds.length;
  if (performers < 1 || performers > MAX_PERFORMERS) {
    errors.push(error('performedByIds', `Choose 1 to ${MAX_PERFORMERS} people who did it.`));
  }
  return errors;
}

// One step at a time, like the screen: family and level only appear once the step before is chosen.
function validateClassification(event) {
  const errors = [];
  if (isBlank(event.pillarId)) return [error('pillarId', 'Choose a pillar.')];
  if (isBlank(event.familyCode)) return [error('familyCode', 'Choose a family.')];
  if (isBlank(event.levelCode)) errors.push(error('levelCode', 'Choose a level.'));
  const questionType = getRiskQuestionType(event.familyCode, event.levelCode);
  if (questionType) {
    const answer = event.riskQuestion && event.riskQuestion.type === questionType ? event.riskQuestion.answer : null;
    if (answer !== true && answer !== false) {
      errors.push(error('riskQuestion', `Answer "Could this be a ${questionType}?".`));
    }
  }
  return errors;
}

// The location is chosen in the location picker; how deep depends on the level (FR-005).
function validateLocation(event) {
  const errors = [];
  const required = getRequiredLocationLevels(event.levelCode);
  if (required.some((level) => isBlank(event.location[level]))) {
    const message =
      required.length === LOCATION_LEVELS.length ? 'Choose the location down to the task.' : 'Choose at least the department and workshop.';
    errors.push(error('location', message));
  }
  if (isTaskTypeRequired(event.levelCode) && isBlank(event.taskTypeId)) {
    errors.push(error('taskTypeId', 'Choose a task type.'));
  }
  return errors;
}

// General information: what happened and to whom (review 2026-10-25).
function validateGeneral(event) {
  const errors = [];
  const title = (event.title || '').trim();
  if (title.length === 0) {
    errors.push(error('title', 'Enter a title.'));
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.push(error('title', `Keep the title under ${MAX_TITLE_LENGTH} characters.`));
  }
  const description = (event.description || '').trim();
  if (description.length === 0) {
    errors.push(error('description', 'Describe what happened.'));
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(error('description', `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`));
  }
  if (isBlank(event.employeeType)) {
    errors.push(error('employeeType', 'Choose the employee type.'));
  } else if (event.employeeType === EMPLOYEE_TYPE_EMPLOYEE) {
    if (isBlank(event.involvedPersonId)) errors.push(error('involvedPersonId', 'Choose the person involved.'));
  } else if (isBlank(event.involvedPersonName)) {
    errors.push(error('involvedPersonName', 'Enter the name of the person involved.'));
  }
  if (isFirstAidRequired(event.levelCode)) {
    const treatments = event.firstAidTreatmentIds || [];
    if (treatments.length === 0) {
      errors.push(error('firstAidTreatmentIds', 'Choose at least one first aid treatment.'));
    } else if (treatments.includes(FIRST_AID_OTHER) && isBlank(event.firstAidOther)) {
      errors.push(error('firstAidOther', 'Describe the other first aid treatment.'));
    }
  }
  return errors;
}

// Event details: when, who reported it, recurrence, sharing and diseases.
function validateDetails(event, now) {
  const errors = [];
  // The event time is optional; when given it cannot be in the future.
  if (!isBlank(event.eventTime) && event.reportDate === toDateString(now) && event.eventTime > toTimeString(now)) {
    errors.push(error('eventTime', 'The event time cannot be in the future.'));
  }
  if (isBlank(event.shiftMoment)) errors.push(error('shiftMoment', 'Choose the shift moment.'));
  if (event.recurrence !== true && event.recurrence !== false) {
    errors.push(error('recurrence', 'Say whether this has happened before.'));
  }
  if (event.familyCode === 'OH' && event.diseaseIds.length === 0) {
    errors.push(error('diseaseIds', 'Choose at least one disease.'));
  }
  return errors;
}

// Immediate actions are optional (FR-012); the ones added must be complete.
function validateActions(event) {
  return event.immediateActions
    .map((action, index) => ({ action, index }))
    .filter(({ action }) => validateImmediateAction(action).length > 0)
    .map(({ index }) => error(`immediateActions.${index}`, `Complete immediate action ${index + 1}.`));
}

// options = { now: Date }
export function validateSection(sectionName, event, options = {}) {
  const now = options.now || new Date();
  switch (sectionName) {
    case 'classification':
      return validateClassification(event);
    case 'location':
      return validateLocation(event);
    case 'general':
      return validateGeneral(event);
    case 'details':
      return validateDetails(event, now);
    case 'actions':
      return validateActions(event);
    default:
      return [];
  }
}

// Every missing or wrong item, each tagged with its section, in page order (FR-014).
export function validateEventForSubmit(event, options = {}) {
  return SECTIONS.flatMap((section) =>
    validateSection(section, event, options).map((item) => ({ section, ...item })),
  );
}
