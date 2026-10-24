// Demo data loaded into the browser database on first launch (research R12).
// All names are fictional.

import { getManagersToAlert } from '../logic/access.js';
import { formatRecordNumber, getCounterId } from '../logic/recordNumber.js';

// ---------------------------------------------------------------------------
// Reference lists
// ---------------------------------------------------------------------------

const pillars = [
  { id: 'pillar-hs', list: 'pillar', code: 'H&S', label: 'Health & Safety' },
  { id: 'pillar-env', list: 'pillar', code: 'ENV', label: 'Environment' },
  { id: 'pillar-ir', list: 'pillar', code: 'IR', label: 'Industrial Risk' },
  { id: 'pillar-ih', list: 'pillar', code: 'IH', label: 'Industrial Hygiene' },
];

const families = [
  { id: 'family-tf', list: 'family', code: 'TF', label: 'Safety', pillarId: 'pillar-hs' },
  { id: 'family-eve', list: 'family', code: 'EVE', label: 'Environment', pillarId: 'pillar-env' },
  { id: 'family-sre', list: 'family', code: 'SRE', label: 'Industrial Risk', pillarId: 'pillar-ir' },
  { id: 'family-oh', list: 'family', code: 'OH', label: 'Occupational Health', pillarId: 'pillar-ih' },
];

function level(code, familyCode, label, description) {
  return {
    id: `level-${code}`,
    list: 'level',
    code,
    familyId: `family-${familyCode.toLowerCase()}`,
    label,
    description,
  };
}

const levels = [
  level('TF1', 'TF', 'Lost Time Accident', 'Someone was hurt and could not work their next shift.'),
  level('TF2', 'TF', 'Non-Lost Time Accident', 'Someone was hurt and needed medical care, but kept working.'),
  level('TF3', 'TF', 'First Aid', 'Someone was slightly hurt and only needed first aid.'),
  level('TF4', 'TF', 'Near Miss', 'Something occurred but nobody was hurt.'),
  level('TF5', 'TF', 'Hazardous Situation', 'Nothing happened yet, but something could hurt someone.'),
  level('EvE1', 'EVE', 'Major environmental accident', 'Serious harm to the environment outside the site.'),
  level('EvE2', 'EVE', 'Environmental accident', 'Harm to the environment that needed outside help to contain.'),
  level('EvE3', 'EVE', 'Minor environmental accident', 'A release contained on site by the team.'),
  level('EvE4', 'EVE', 'Near-accident', 'A release almost happened but was stopped in time.'),
  level('EvE5', 'EVE', 'Poor environmental situation', 'A condition that could lead to a release or waste.'),
  level('SRE1', 'SRE', 'Major site risk accident', 'Fire, explosion or failure with major damage to the site.'),
  level('SRE2', 'SRE', 'Significant site risk accident', 'Fire or failure with significant damage, contained on site.'),
  level('SRE3', 'SRE', 'Moderate site risk accident', 'A small fire or failure with limited damage.'),
  level('SRE4', 'SRE', 'Site risk near accident', 'A fire or failure almost happened but was stopped in time.'),
  level('SRE5', 'SRE', 'Site risk hazardous acts or conditions', 'An unsafe act or condition that could cause a fire or failure.'),
  // Industrial Hygiene is classified by disease type instead of levels 1-5.
  level('OH-RESP', 'OH', 'Respiratory disease', 'Breathing problems linked to dust, fumes or chemicals at work.'),
  level('OH-SKIN', 'OH', 'Skin disease', 'Skin irritation or allergy linked to contact with substances.'),
  level('OH-MSD', 'OH', 'Musculoskeletal disorder', 'Pain in muscles or joints linked to movements or loads.'),
  level('OH-HEAR', 'OH', 'Hearing loss', 'Hearing damage linked to noise at work.'),
];

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

const actionCategories = [
  { id: 'category-1', list: 'actionCategory', label: 'Isolate the area' },
  { id: 'category-2', list: 'actionCategory', label: 'Repair or secure equipment' },
  { id: 'category-3', list: 'actionCategory', label: 'Clean up' },
  { id: 'category-4', list: 'actionCategory', label: 'Care for people' },
];

// sortOrder keeps lists in the order written here (the database returns them sorted by id).
export const reference = [
  ...pillars,
  ...families,
  ...levels,
  ...diseases,
  ...simpleList('taskType', ['Routine', 'Non-routine', 'Maintenance', 'Cleaning']),
  ...simpleList('employeeType', [
    'Employee',
    'Temporary Worker',
    'Permanent Contractor',
    'Non-Permanent Contractor',
    'Other',
  ]),
  ...simpleList('shiftMoment', ['Day', 'Night', 'Afternoon']),
  ...simpleList('actionPriority', ['Low', 'Medium', 'High']),
  ...actionCategories,
].map((item, index) => ({ ...item, sortOrder: index }));

// ---------------------------------------------------------------------------
// Organization: businesses, plants and the location hierarchy
// ---------------------------------------------------------------------------

const businesses = [
  { id: 'biz-auto', type: 'business', name: 'Automotive Parts', parentId: null },
  { id: 'biz-pack', type: 'business', name: 'Packaging', parentId: null },
];

const plants = [
  {
    id: 'plant-lyon',
    type: 'plant',
    name: 'Lyon',
    parentId: 'biz-auto',
    plantTypeIcon: '🏭',
    plantTypeLabel: 'Factory',
    countryFlag: '🇫🇷',
    countryName: 'France',
  },
  {
    id: 'plant-curitiba',
    type: 'plant',
    name: 'Curitiba',
    parentId: 'biz-auto',
    plantTypeIcon: '🔧',
    plantTypeLabel: 'Assembly plant',
    countryFlag: '🇧🇷',
    countryName: 'Brazil',
  },
  {
    id: 'plant-porto',
    type: 'plant',
    name: 'Porto',
    parentId: 'biz-pack',
    plantTypeIcon: '🏬',
    plantTypeLabel: 'Distribution center',
    countryFlag: '🇵🇹',
    countryName: 'Portugal',
  },
];

// Names used at each level of the location hierarchy, two per level.
const locationNames = {
  department: ['Assembly', 'Logistics'],
  workshop: ['Workshop North', 'Workshop South'],
  job: ['Line operator', 'Forklift driver'],
  workstation: ['Station 10', 'Station 20'],
  task: ['Loading parts', 'Quality check'],
};

const childType = {
  plant: 'department',
  department: 'workshop',
  workshop: 'job',
  job: 'workstation',
  workstation: 'task',
};

// Builds two children for each node, down to tasks, with ids that show the path
// (e.g. "plant-lyon/department-1/workshop-2").
function buildLocations(parent) {
  const type = childType[parent.type];
  if (!type) {
    return [];
  }
  const children = locationNames[type].map((name, index) => ({
    id: `${parent.id}/${type}-${index + 1}`,
    type,
    name,
    parentId: parent.id,
  }));
  return children.flatMap((child) => [child, ...buildLocations(child)]);
}

export const organization = [
  ...businesses,
  ...plants,
  ...plants.flatMap((plant) => buildLocations(plant)),
];

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------

const allPillars = ['pillar-hs', 'pillar-env', 'pillar-ir', 'pillar-ih'];

export const users = [
  {
    id: 'user-ana',
    name: 'Ana Ribeiro',
    avatar: 'AR',
    role: 'User',
    access: [{ businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds: allPillars }],
  },
  {
    id: 'user-ben',
    name: 'Ben Okafor',
    avatar: 'BO',
    role: 'User',
    access: [{ businessId: 'biz-auto', plantId: 'plant-curitiba', pillarIds: ['pillar-hs', 'pillar-env'] }],
  },
  {
    id: 'user-carla',
    name: 'Carla Mendes',
    avatar: 'CM',
    role: 'Manager',
    access: [{ businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds: allPillars }],
  },
  {
    id: 'user-diego',
    name: 'Diego Laurent',
    avatar: 'DL',
    role: 'Manager',
    access: [
      { businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds: ['pillar-hs', 'pillar-ir'] },
      { businessId: 'biz-pack', plantId: 'plant-porto', pillarIds: allPillars },
    ],
  },
  {
    id: 'user-eva',
    name: 'Eva Novak',
    avatar: 'EN',
    role: 'Site Admin',
    access: [{ businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds: allPillars }],
  },
  {
    id: 'user-felix',
    name: 'Felix Tanaka',
    avatar: 'FT',
    role: 'Manager',
    access: [{ businessId: 'biz-auto', plantId: 'plant-curitiba', pillarIds: allPillars }],
  },
  {
    id: 'user-gina',
    name: 'Gina Rossi',
    avatar: 'GR',
    role: 'User',
    access: [{ businessId: 'biz-pack', plantId: 'plant-porto', pillarIds: allPillars }],
  },
];

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
  ['Missing guard on conveyor', 'TF', 'TF5', 'plant-lyon', 'user-carla', true, 'Open', '2026-09-15', '09:00', false],
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
  ['Stack of pallets leaning in aisle 7', 'TF', 'TF5', 'plant-porto', 'user-gina', true, 'Open', '2026-09-07', '06:30', false],
  ['Truck reversed into loading dock door', 'TF', 'TF4', 'plant-porto', 'user-gina', true, 'Open', '2026-09-17', '05:55', false],
  ['Shrink-wrap machine heater fire', 'SRE', 'SRE3', 'plant-porto', 'user-diego', false, 'Open', '2026-09-25', '23:10', true],
  ['Dust from cardboard cutting', 'OH', 'OH-RESP', 'plant-porto', 'user-gina', null, 'Open', '2026-10-02', '11:45', false],
  ['Plastic film waste in open skip', 'EVE', 'EvE5', 'plant-porto', 'user-gina', false, 'Open', '2026-10-10', '14:20', false],
];

const diseaseOfLevel = {
  'OH-RESP': ['disease-1'],
  'OH-SKIN': ['disease-2'],
  'OH-MSD': ['disease-3', 'disease-4'],
  'OH-HEAR': ['disease-5'],
};

function sampleImmediateAction(eventId, reporterId, reportDate) {
  return {
    id: `${eventId}-action-1`,
    description: 'Area made safe and people informed',
    priority: 'actionPriority-3',
    categoryId: 'category-1',
    completionDate: reportDate,
    kpiId: '',
    comments: '',
    performedByIds: [reporterId],
    status: 'Completed',
    createdAt: `${reportDate}T12:00:00`,
  };
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
      taskTypeId: `taskType-${(index % 4) + 1}`,
      title,
      reporterId,
      reportDate,
      eventTime,
      shiftMoment: `shiftMoment-${(index % 3) + 1}`,
      description: `${title}. Reported from the shop floor during the shift.`,
      employeeType: `employeeType-${(index % 5) + 1}`,
      recurrence: index % 4 === 0,
      comments: '',
      feedbackEmails: [],
      diseaseIds: diseaseOfLevel[levelCode] || [],
      immediateActions: needsAction ? [sampleImmediateAction(id, reporterId, reportDate)] : [],
      attachmentIds: [],
      createdBy: reporterId,
      createdAt: timestamp,
      updatedBy: reporterId,
      updatedAt: timestamp,
      submittedAt: status === 'Open' ? timestamp : null,
    };
  });

  return {
    events,
    counters: Object.entries(counters).map(([id, lastSequence]) => ({ id, lastSequence })),
  };
}

const sample = buildSampleEvents();

export const events = sample.events;
export const counters = sample.counters;

// A few "Event submitted" alerts: one per Manager for the two latest submitted events of each plant.
export const alerts = plants
  .flatMap((plant) =>
    events.filter((event) => event.status === 'Open' && event.plantId === plant.id).slice(-2),
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
