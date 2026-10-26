// Demo data loaded into the browser database on first launch (research R12).
// Users, plants, pillars and levels are shared platform data (shared/platform/sampleData.js);
// this file keeps the form lists and the sample events. All names are fictional.

import { organization, users, workflowSettings } from '../../../../shared/platform/sampleData.js';
import { getPlants } from '../../../../shared/platform/organization.js';
import { workflowForEvent } from '../../../../shared/platform/workflow.js';
import { getSubmittedStatus } from '../logic/submission.js';
import { getManagersToAlert } from '../logic/access.js';
import { formatRecordNumber, getCounterId } from '../logic/recordNumber.js';

// ---------------------------------------------------------------------------
// Form lists (pillars, families and levels come from the platform data)
// ---------------------------------------------------------------------------

function simpleList(list, labels) {
  return labels.map((label, index) => ({ id: `${list}-${index + 1}`, list, label }));
}

const diseases = [
  { id: 'disease-1', list: 'disease', label: 'Occupational asthma', familyId: 'family-oh' },
  { id: 'disease-2', list: 'disease', label: 'Contact dermatitis', familyId: 'family-oh' },
  { id: 'disease-3', list: 'disease', label: 'Carpal tunnel syndrome', familyId: 'family-oh' },
  { id: 'disease-4', list: 'disease', label: 'Lower back pain', familyId: 'family-oh' },
  { id: 'disease-5', list: 'disease', label: 'Noise-induced hearing loss', familyId: 'family-oh' },
];

// sortOrder keeps lists in the order written here (the database returns them sorted by id).
export const reference = [
  ...diseases,
  ...simpleList('taskType', ['Routine', 'Non-routine']),
  ...simpleList('employeeType', [
    'Employee',
    'Temporary Worker',
    'Permanent Contractor',
    'Non-Permanent Contractor',
    'Other',
  ]),
  ...simpleList('shiftMoment', ['Day', 'Night', 'Afternoon']),
  // Starting list for TF1–TF3 (FR-047); to be replaced by the official list.
  ...simpleList('firstAidTreatment', [
    'Wound cleaning and dressing',
    'Plaster or bandage',
    'Cold compress',
    'Eye wash',
    'Burn care',
    'Splint or immobilisation',
    'Removal of a splinter or foreign body',
    'Rest and observation',
    'Other',
  ]),
  ...simpleList('actionPriority', ['Low', 'Medium', 'High', 'Urgent']),
  // SIP types of safety events, from the safety event source ("HPR Type") (003 FR-024).
  ...simpleList('sipTypeHs', [
    'Entry to machine area without LOTO',
    'Confined Space entry without permit',
    'Any unsecured Confined Space',
    'Unguarded access to the dangerous parts of equipment',
    'Collision of vehicle or its load with another vehicle, a pedestrian or with a building',
    'Roll over or tip-over of a vehicle',
    'Loss of load or part of load from a vehicle',
    'Collapse of a stacked material',
    'Object falling or likely to fall from height',
    'Failure of lifting equipment or falling load',
    'Unsecured access point to permit required roof',
    'Person working unsafely at height',
    'Any unsafe electrical work or electrical equipment in poor conditions',
    'Any Fire or Explosion',
    'Any other incident that could cause a serious injury',
  ]),
  // SIP types of environment events, from the business (006 review remarks).
  ...simpleList('sipTypeEnv', [
    'Significant or major spill/leak due to a failure of chemical or fuel tanks',
    'Significant or major impact due to overfilling/delivery failure or tanker cleaning',
    'Significant or major spill/leak due to the release of very toxic, toxic or hazardous substances',
    'Significant or major spill or leak from underground tank',
    'Significant or major release to air of very toxic, toxic or hazardous substances',
    'Significant or major release to air (odour, noise etc.) that is likely to cause nuisance',
    'Illegal waste disposal due to contamination of waste/incorrect segregation',
    'Contamination of waste received as a raw material (e.g. asbestos)',
    'Significant land contamination',
    'Impact to Protected species/habitats or other sensitive receptors',
    'Potential to create or exacerbate critical environmental risk(s)',
    'Damaging impact that would be permanent',
    'Impact that needs specific remediation',
    'Impact where the environment needs a long time to recover',
    'Enforcement action by the Regulatory Authority',
    'Significant financial penalty or cost',
    'Reputational damage with stakeholders',
  ]),
].map((item, index) => ({ ...item, sortOrder: index }));

// ---------------------------------------------------------------------------
// Sample events
// ---------------------------------------------------------------------------

const pillarOfFamily = {
  TF: 'pillar-hs',
  EVE: 'pillar-env',
  SRE: 'pillar-ir',
  OH: 'pillar-ih',
};

const businessOfPlant = {
  'plant-lyon': 'biz-auto',
  'plant-curitiba': 'biz-auto',
  'plant-porto': 'biz-pack',
};

function riskQuestionFor(familyCode, levelCode, answer) {
  if (familyCode === 'TF' || familyCode === 'EVE') {
    return { type: 'SIP', answer };
  }
  if (familyCode === 'SRE') {
    const type = ['SRE1', 'SRE2'].includes(levelCode) ? 'CRP' : 'SRP';
    return { type, answer };
  }
  return null;
}

// Picks one branch of the location hierarchy; "variant" (0-31) chooses which.
function locationFor(plantId, variant) {
  const pick = (bit) => ((variant >> bit) & 1) + 1;
  const department = `${plantId}/department-${pick(0)}`;
  const workshop = `${department}/workshop-${pick(1)}`;
  const job = `${workshop}/job-${pick(2)}`;
  const workstation = `${job}/workstation-${pick(3)}`;
  const task = `${workstation}/task-${pick(4)}`;
  return {
    departmentId: department,
    workshopId: workshop,
    jobId: job,
    workstationId: workstation,
    taskId: task,
  };
}

// One row per sample event:
// [title, family, level, plant, reporter, risk answer, status, report date, time, needs action]
const eventRows = [
  ['Forklift almost hit a pedestrian at dock 3', 'TF', 'TF4', 'plant-lyon', 'user-ana', true, 'Open', '2026-09-02', '08:15', false],
  ['Operator cut finger on sheet metal edge', 'TF', 'TF3', 'plant-lyon', 'user-ana', false, 'Open', '2026-09-05', '10:40', true],
  ['Oil leak under press 4', 'EVE', 'EvE4', 'plant-lyon', 'user-carla', false, 'Open', '2026-09-08', '14:05', false],
  ['Worker slipped on wet floor and twisted ankle', 'TF', 'TF2', 'plant-lyon', 'user-ana', true, 'Open', '2026-09-10', '06:50', true],
  ['Sparks from grinder near cardboard boxes', 'SRE', 'SRE4', 'plant-lyon', 'user-diego', true, 'Open', '2026-09-12', '15:30', false],
  ['Missing guard on conveyor', 'TF', 'TF4', 'plant-lyon', 'user-carla', true, 'Open', '2026-09-15', '09:00', false],
  ['Chemical drum stored outside bunded area', 'EVE', 'EvE5', 'plant-lyon', 'user-ana', false, 'Open', '2026-09-18', '11:20', false],
  ['Small fire in electrical cabinet', 'SRE', 'SRE3', 'plant-lyon', 'user-carla', false, 'Open', '2026-09-20', '22:10', true],
  ['Operator reports wrist pain after long shifts', 'OH', 'OH-MSD', 'plant-lyon', 'user-ana', null, 'Open', '2026-09-22', '13:00', false],
  ['Fall from ladder during maintenance', 'TF', 'TF1', 'plant-lyon', 'user-carla', true, 'Open', '2026-09-24', '07:45', true],
  ['Coolant spill reached rain drain', 'EVE', 'EvE2', 'plant-lyon', 'user-carla', true, 'Open', '2026-09-26', '16:35', false],
  ['Compressed air hose whipped loose', 'SRE', 'SRE5', 'plant-lyon', 'user-diego', false, 'Open', '2026-09-29', '10:10', false],
  ['Pallet fell from racking, nobody nearby', 'TF', 'TF4', 'plant-lyon', 'user-ana', true, 'Open', '2026-10-01', '12:25', false],
  ['Skin rash after handling new degreaser', 'OH', 'OH-SKIN', 'plant-lyon', 'user-ana', null, 'Open', '2026-10-03', '09:40', false],
  ['Gas cylinder valve found damaged', 'SRE', 'SRE2', 'plant-lyon', 'user-carla', true, 'Open', '2026-10-06', '08:00', true],
  ['Blocked emergency exit in warehouse', 'TF', 'TF5', 'plant-lyon', 'user-ana', false, 'Open', '2026-10-09', '17:15', false],
  ['Hand caught in press, glove torn', 'TF', 'TF4', 'plant-lyon', 'user-ana', true, 'Draft', '2026-10-20', '11:00', false],
  ['Hydraulic oil drip from forklift', 'EVE', 'EvE4', 'plant-lyon', 'user-carla', false, 'Draft', '2026-10-21', '14:30', false],
  ['Worker hit head on low beam', 'TF', 'TF3', 'plant-curitiba', 'user-ben', false, 'Open', '2026-09-04', '09:30', true],
  ['Paint fumes in booth 2', 'EVE', 'EvE5', 'plant-curitiba', 'user-ben', false, 'Open', '2026-09-11', '15:00', false],
  ['Overheated motor smoking', 'SRE', 'SRE3', 'plant-curitiba', 'user-felix', false, 'Open', '2026-09-19', '20:45', true],
  ['Noise above limit near stamping line', 'OH', 'OH-HEAR', 'plant-curitiba', 'user-felix', null, 'Open', '2026-09-27', '10:00', false],
  ['Trolley wheel broke while loaded', 'TF', 'TF4', 'plant-curitiba', 'user-ben', true, 'Open', '2026-10-04', '13:50', false],
  ['Burn from hot part out of oven', 'TF', 'TF2', 'plant-curitiba', 'user-ben', true, 'Open', '2026-10-12', '07:20', true],
  ['Unlabelled waste container', 'EVE', 'EvE5', 'plant-curitiba', 'user-ben', false, 'Draft', '2026-10-22', '16:00', false],
  ['Stack of pallets leaning in aisle 7', 'TF', 'TF4', 'plant-porto', 'user-gina', true, 'Open', '2026-09-07', '06:30', false],
  ['Truck reversed into loading dock door', 'TF', 'TF4', 'plant-porto', 'user-gina', true, 'Open', '2026-09-17', '05:55', false],
  ['Shrink-wrap machine heater fire', 'SRE', 'SRE3', 'plant-porto', 'user-diego', false, 'Open', '2026-09-25', '23:10', true],
  ['Dust from cardboard cutting', 'OH', 'OH-RESP', 'plant-porto', 'user-gina', null, 'Open', '2026-10-02', '11:45', false],
  ['Plastic film waste in open skip', 'EVE', 'EvE5', 'plant-porto', 'user-gina', false, 'Open', '2026-10-10', '14:20', false],
];

// Names of people involved who are not employees (contractors, temporary workers…).
const outsideNames = ['Sam Lee', 'Noah Petit', 'Ines Duarte', 'Tom Baker'];

const diseaseOfLevel = {
  'OH-RESP': ['disease-1'],
  'OH-SKIN': ['disease-2'],
  'OH-MSD': ['disease-3', 'disease-4'],
  'OH-HEAR': ['disease-5'],
};

// The category of an immediate action is the event's pillar (review 2026-10-25).
function sampleImmediateAction(eventId, reporterId, reportDate, pillarId) {
  return {
    id: `${eventId}-action-1`,
    description: 'Area made safe and people informed',
    priority: 'actionPriority-3',
    pillarId,
    completionDate: reportDate,
    comments: '',
    performedByIds: [reporterId],
    status: 'Completed',
    createdAt: `${reportDate}T12:00:00`,
  };
}

// Submitted sample events keep the workflow of the starting Control Panel settings, and are
// Closed when it requires nothing besides Submission (002 FR-012, FR-026).
function withWorkflow(event) {
  if (event.status === 'Draft') {
    return event;
  }
  const workflow = { ...workflowForEvent(workflowSettings, users, event), computedAt: event.submittedAt };
  const status = getSubmittedStatus(workflow);
  return { ...event, workflow, status, closedAt: status === 'Closed' ? event.submittedAt : null };
}

function buildSampleEvents() {
  const sequences = {};
  const counters = {};

  const events = eventRows.map((row, index) => {
    const [title, familyCode, levelCode, plantId, reporterId, riskAnswer, status, reportDate, eventTime, needsAction] = row;
    const id = `sample-event-${index + 1}`;
    const timestamp = `${reportDate}T${eventTime}:00`;

    let recordNumber = null;
    if (status === 'Open') {
      const counterId = getCounterId(familyCode, 2026);
      sequences[counterId] = (sequences[counterId] || 0) + 1;
      counters[counterId] = sequences[counterId];
      recordNumber = formatRecordNumber(familyCode, 2026, sequences[counterId]);
    }

    return {
      id,
      recordNumber,
      status,
      businessId: businessOfPlant[plantId],
      plantId,
      pillarId: pillarOfFamily[familyCode],
      familyCode,
      levelCode,
      riskQuestion: riskQuestionFor(familyCode, levelCode, riskAnswer),
      location: locationFor(plantId, index % 32),
      taskTypeId: `taskType-${(index % 2) + 1}`,
      title,
      reporterId,
      reportDate,
      eventTime,
      shiftMoment: `shiftMoment-${(index % 3) + 1}`,
      description: `${title}. Reported from the shop floor during the shift.`,
      employeeType: `employeeType-${(index % 5) + 1}`,
      // Employee: the person is a user of the plant; otherwise a name and what they were doing.
      involvedPersonId: index % 5 === 0 ? reporterId : '',
      involvedPersonName: index % 5 === 0 ? '' : outsideNames[index % outsideNames.length],
      involvedActivity: index % 5 === 0 ? '' : 'Moving pallets near the line',
      firstAidTreatmentIds: ['TF1', 'TF2', 'TF3'].includes(levelCode) ? [`firstAidTreatment-${(index % 8) + 1}`] : [],
      firstAidOther: '',
      recurrence: index % 4 === 0,
      sharedWithIds: [],
      diseaseIds: diseaseOfLevel[levelCode] || [],
      immediateActions: needsAction ? [sampleImmediateAction(id, reporterId, reportDate, pillarOfFamily[familyCode])] : [],
      attachmentIds: [],
      createdBy: reporterId,
      createdAt: timestamp,
      updatedBy: reporterId,
      updatedAt: timestamp,
      submittedAt: status === 'Open' ? timestamp : null,
    };
  });

  return {
    events: events.map(withWorkflow),
    counters: Object.entries(counters).map(([id, lastSequence]) => ({ id, lastSequence })),
  };
}

const sample = buildSampleEvents();

export const events = sample.events;
export const counters = sample.counters;

// A few "Event submitted" alerts: one per Manager for the two latest submitted events of each plant.
export const alerts = getPlants(organization)
  .flatMap((plant) =>
    events.filter((event) => event.status !== 'Draft' && event.plantId === plant.id).slice(-2),
  )
  .flatMap((event) =>
    getManagersToAlert(users, event).map((manager) => ({
      id: `sample-alert-${event.id}-${manager.id}`,
      recipientId: manager.id,
      type: 'Event submitted',
      eventId: event.id,
      createdAt: event.submittedAt,
    })),
  );
