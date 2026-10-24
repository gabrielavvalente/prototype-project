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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function validateImmediateAction(action, reportDate, today) {
  const errors = [];
  if (isBlank(action.description)) errors.push(error('description', 'Describe the action.'));
  if (isBlank(action.priority)) errors.push(error('priority', 'Choose a priority.'));
  if (isBlank(action.categoryId)) errors.push(error('categoryId', 'Choose a category.'));
  if (isBlank(action.completionDate)) {
    errors.push(error('completionDate', 'Enter when the action was done.'));
  } else if (action.completionDate > today || action.completionDate < reportDate) {
    errors.push(error('completionDate', 'The date must be between the report date and today.'));
  }
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

// The location is chosen as a whole in the location picker (FR-005).
function validateLocation(event) {
  const errors = [];
  if (LOCATION_LEVELS.some((level) => isBlank(event.location[level]))) {
    errors.push(error('location', 'Choose the location down to the task.'));
  }
  if (isBlank(event.taskTypeId)) errors.push(error('taskTypeId', 'Choose a task type.'));
  return errors;
}

function validateGeneral(event, now) {
  const errors = [];
  const title = (event.title || '').trim();
  if (title.length === 0) {
    errors.push(error('title', 'Enter a title.'));
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.push(error('title', `Keep the title under ${MAX_TITLE_LENGTH} characters.`));
  }
  if (isBlank(event.eventTime)) {
    errors.push(error('eventTime', 'Enter the time of the event.'));
  } else if (event.reportDate === toDateString(now) && event.eventTime > toTimeString(now)) {
    errors.push(error('eventTime', 'The event time cannot be in the future.'));
  }
  if (isBlank(event.shiftMoment)) errors.push(error('shiftMoment', 'Choose the shift moment.'));
  const description = (event.description || '').trim();
  if (description.length === 0) {
    errors.push(error('description', 'Describe what happened.'));
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(error('description', `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`));
  }
  return errors;
}

function validateDetails(event) {
  const errors = [];
  if (isBlank(event.employeeType)) errors.push(error('employeeType', 'Choose the employee type.'));
  if (event.recurrence !== true && event.recurrence !== false) {
    errors.push(error('recurrence', 'Say whether this has happened before.'));
  }
  if (event.feedbackEmails.some((email) => !EMAIL_PATTERN.test(email.trim()))) {
    errors.push(error('feedbackEmails', 'Check the email addresses.'));
  }
  if (event.familyCode === 'OH' && event.diseaseIds.length === 0) {
    errors.push(error('diseaseIds', 'Choose at least one disease.'));
  }
  return errors;
}

// Immediate actions are optional (FR-012); the ones added must be complete.
function validateActions(event, now) {
  const today = toDateString(now);
  return event.immediateActions
    .map((action, index) => ({ action, index }))
    .filter(({ action }) => validateImmediateAction(action, event.reportDate, today).length > 0)
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
      return validateGeneral(event, now);
    case 'details':
      return validateDetails(event);
    case 'actions':
      return validateActions(event, now);
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
