// Turns an event into readable label/value rows, grouped like the form sections.
// Used by the form summary and the event detail page.

import { findFamilyByCode, findLevelByCode, getLabel } from './lookups.js';

function yesNo(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '';
}

function listLabels(items, ids) {
  return ids.map((id) => getLabel(items, id)).join(', ');
}

export const SECTION_TITLES = {
  classification: 'Classification',
  location: 'Location',
  general: 'General information',
  details: 'Event details',
  actions: 'Immediate actions',
};

// lists = { reference, organization, users }
export function describeEvent(event, lists, attachmentCount) {
  const { reference, organization, users } = lists;
  const family = findFamilyByCode(reference, event.familyCode);
  const level = findLevelByCode(reference, event.levelCode);
  const rows = {
    classification: [
      { label: 'Pillar', value: getLabel(reference, event.pillarId) },
      { label: 'Family', value: family ? `${family.code} — ${family.label}` : '' },
      { label: 'Level', value: level ? `${level.code} — ${level.label}` : '' },
    ],
    location: [
      { label: 'Plant', value: getLabel(organization, event.plantId) },
      { label: 'Department', value: getLabel(organization, event.location.departmentId) },
      { label: 'Workshop', value: getLabel(organization, event.location.workshopId) },
      { label: 'Job', value: getLabel(organization, event.location.jobId) },
      { label: 'Workstation', value: getLabel(organization, event.location.workstationId) },
      { label: 'Task', value: getLabel(organization, event.location.taskId) },
      { label: 'Task type', value: getLabel(reference, event.taskTypeId) },
    ],
    general: [
      { label: 'Title', value: event.title },
      { label: 'Description', value: event.description },
      { label: 'Photos and videos', value: String(attachmentCount) },
      { label: 'Employee type', value: getLabel(reference, event.employeeType) },
      { label: 'Person involved', value: event.involvedPersonId ? getLabel(users, event.involvedPersonId) : event.involvedPersonName },
    ],
    details: [
      { label: 'Reporter', value: getLabel(users, event.reporterId) },
      { label: 'Report date', value: event.reportDate },
      { label: 'Event time', value: event.eventTime },
      { label: 'Shift moment', value: getLabel(reference, event.shiftMoment) },
      { label: 'Has this happened before?', value: yesNo(event.recurrence) },
      { label: 'Shared with', value: listLabels(users, event.sharedWithIds) },
    ],
    actions: [{ label: 'Immediate actions', value: String(event.immediateActions.length) }],
  };

  if (event.riskQuestion) {
    rows.classification.push({
      label: `Could this be a ${event.riskQuestion.type}?`,
      value: yesNo(event.riskQuestion.answer),
    });
  }
  if (event.involvedActivity) {
    rows.general.push({ label: 'What was the person doing?', value: event.involvedActivity });
  }
  if (event.firstAidTreatmentIds?.length > 0) {
    const treatments = listLabels(reference, event.firstAidTreatmentIds);
    rows.general.push({ label: 'First aid treatment', value: event.firstAidOther ? `${treatments} (${event.firstAidOther})` : treatments });
  }
  if (event.familyCode === 'OH') {
    rows.details.push({ label: 'Disease(s)', value: listLabels(reference, event.diseaseIds) });
  }

  return Object.entries(rows).map(([section, sectionRows]) => ({
    section,
    title: SECTION_TITLES[section],
    rows: sectionRows,
  }));
}

export function describeImmediateAction(action, lists) {
  const { reference, users } = lists;
  return [
    { label: 'Description', value: action.description },
    { label: 'Priority', value: getLabel(reference, action.priority) },
    { label: 'Category', value: getLabel(reference, action.pillarId) },
    { label: 'Completion date', value: action.completionDate },
    { label: 'Comments', value: action.comments },
    { label: 'Performed by', value: listLabels(users, action.performedByIds) },
    { label: 'Status', value: action.status },
  ];
}
