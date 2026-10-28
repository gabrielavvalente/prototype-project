// Platform demo data shared by every app (research R3, R8): pillars, families and levels,
// the organization (businesses, plants, location hierarchy) and the demo users with their event
// access and Control Panel roles. All names are fictional.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import { withSiteAdminRoles } from './permissions.js';

// ---------------------------------------------------------------------------
// Pillars, families and levels
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

// sortOrder keeps lists in the order written here (the database returns them sorted by id).
export const reference = [...pillars, ...families, ...levels].map((item, index) => ({
  ...item,
  sortOrder: index,
}));

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
    region: 'Europe',
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
    region: 'Latin America',
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
    region: 'Europe',
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
// role / access: event role and the plants and pillars they report and see (null / [] when the
// person only uses the Control Panel).
// controlPanelRoles: { pillarId, level, plantIds } — central: all plants; cluster: 2+ plants;
// local: exactly one plant. At most one role per pillar per user. Site Admins get their Local
// roles from their event access (withSiteAdminRoles), so they are not written here.
// ---------------------------------------------------------------------------

const allPillars = ['pillar-hs', 'pillar-env', 'pillar-ir', 'pillar-ih'];
const allPlants = plants.map((plant) => plant.id);

function central(pillarId) {
  return { pillarId, level: 'central', plantIds: allPlants };
}

function cluster(pillarId, plantIds) {
  return { pillarId, level: 'cluster', plantIds };
}

function local(pillarId, plantId) {
  return { pillarId, level: 'local', plantIds: [plantId] };
}

const demoUsers = [
  {
    id: 'user-ana',
    name: 'Ana Ribeiro',
    avatar: 'AR',
    role: 'User',
    access: [{ businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds: allPillars }],
    controlPanelRoles: [],
  },
  {
    id: 'user-ben',
    name: 'Ben Okafor',
    avatar: 'BO',
    role: 'User',
    access: [{ businessId: 'biz-auto', plantId: 'plant-curitiba', pillarIds: ['pillar-hs', 'pillar-env'] }],
    controlPanelRoles: [],
  },
  {
    id: 'user-carla',
    name: 'Carla Mendes',
    avatar: 'CM',
    role: 'Manager',
    access: [{ businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds: allPillars }],
    // A second Local administrator on Lyon, to show changing someone else's setting (FR-009).
    controlPanelRoles: [local('pillar-hs', 'plant-lyon')],
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
    controlPanelRoles: [],
  },
  {
    id: 'user-eva',
    name: 'Eva Novak',
    avatar: 'EN',
    role: 'Site Admin',
    access: [{ businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds: allPillars }],
    controlPanelRoles: [],
  },
  {
    id: 'user-felix',
    name: 'Felix Tanaka',
    avatar: 'FT',
    role: 'Manager',
    access: [{ businessId: 'biz-auto', plantId: 'plant-curitiba', pillarIds: allPillars }],
    controlPanelRoles: [local('pillar-hs', 'plant-curitiba'), local('pillar-env', 'plant-curitiba')],
  },
  {
    id: 'user-gina',
    name: 'Gina Rossi',
    avatar: 'GR',
    role: 'User',
    access: [{ businessId: 'biz-pack', plantId: 'plant-porto', pillarIds: allPillars }],
    controlPanelRoles: [],
  },
  {
    id: 'user-ludovic',
    name: 'Ludovic Costa',
    avatar: 'LC',
    role: null,
    access: [],
    controlPanelRoles: [central('pillar-hs'), central('pillar-ih')],
  },
  {
    id: 'user-ed',
    name: 'Ed Petrov',
    avatar: 'EP',
    role: null,
    access: [],
    controlPanelRoles: [central('pillar-env')],
  },
  {
    id: 'user-sergio',
    name: 'Sergio Martins',
    avatar: 'SM',
    role: null,
    access: [],
    controlPanelRoles: [central('pillar-ir')],
  },
  {
    id: 'user-lucas',
    name: 'Lucas Weber',
    avatar: 'LW',
    role: 'Manager',
    access: [
      { businessId: 'biz-auto', plantId: 'plant-lyon', pillarIds: ['pillar-hs', 'pillar-env'] },
      { businessId: 'biz-pack', plantId: 'plant-porto', pillarIds: ['pillar-hs', 'pillar-env'] },
    ],
    controlPanelRoles: [
      cluster('pillar-hs', ['plant-lyon', 'plant-porto']),
      cluster('pillar-env', ['plant-lyon', 'plant-porto']),
    ],
  },
  {
    id: 'user-pascal',
    name: 'Pascal Fischer',
    avatar: 'PF',
    role: null,
    access: [],
    // Overlaps Lucas Weber on Lyon (overlapping clusters, Edge Cases).
    controlPanelRoles: [cluster('pillar-hs', ['plant-lyon', 'plant-curitiba'])],
  },
];

export const users = demoUsers.map(withSiteAdminRoles);

// ---------------------------------------------------------------------------
// Investigation groups (feature 004): fixed sample groups a reviewer can designate for a root
// cause analysis. No screen edits them; User Management lists them read-only.
// ---------------------------------------------------------------------------

export const investigationGroups = [
  {
    id: 'group-lyon-hs',
    name: 'Lyon H&S investigation team',
    pillarIds: ['pillar-hs'],
    plantIds: ['plant-lyon'],
    memberIds: ['user-carla', 'user-eva', 'user-ana'],
  },
  {
    id: 'group-electrical',
    name: 'Cluster electrical safety team',
    pillarIds: ['pillar-hs', 'pillar-ir'],
    plantIds: ['plant-lyon', 'plant-porto'],
    memberIds: ['user-diego', 'user-lucas', 'user-gina'],
  },
  {
    id: 'group-curitiba-ehs',
    name: 'Curitiba EHS team',
    pillarIds: allPillars,
    plantIds: ['plant-curitiba'],
    memberIds: ['user-felix', 'user-ben'],
  },
  {
    id: 'group-porto-env',
    name: 'Porto environment team',
    pillarIds: ['pillar-env'],
    plantIds: ['plant-porto'],
    memberIds: ['user-gina', 'user-diego'],
  },
];

// ---------------------------------------------------------------------------
// Starting workflow settings (only Required ones are stored, research R5). Central requires Review
// on most levels of each pillar and a few more phases; Eva Novak adds Validation for TF1 at Lyon.
// The lowest levels (TF5, EvE5, SRE5) require nothing, so their events close right after
// submission (FR-026).
// ---------------------------------------------------------------------------

const SEEDED_AT = '2026-10-20T09:00:00.000Z';

function requiredSetting(pillarId, levelCode, phase, role, authorId, reviewerIds = []) {
  return {
    id: `setting-${pillarId}-${levelCode}-${phase}-${role.level}`,
    pillarId,
    levelCode,
    phase,
    scopeLevel: role.level,
    plantIds: role.plantIds,
    reviewerIds,
    authorId,
    updatedAt: SEEDED_AT,
  };
}

// Managers and Site Admins of every plant, so each plant has someone to review.
const reviewers = ['user-carla', 'user-eva', 'user-felix', 'user-diego'];

function centralSettings(pillarId, authorId, phase, levelCodes) {
  const ids = phase === 'review' ? reviewers : [];
  return levelCodes.map((code) => requiredSetting(pillarId, code, phase, central(pillarId), authorId, ids));
}

export const workflowSettings = [
  ...centralSettings('pillar-hs', 'user-ludovic', 'review', ['TF1', 'TF2', 'TF3', 'TF4']),
  ...centralSettings('pillar-hs', 'user-ludovic', 'actions', ['TF1', 'TF2']),
  requiredSetting('pillar-hs', 'TF1', 'validation', local('pillar-hs', 'plant-lyon'), 'user-eva'),
  ...centralSettings('pillar-env', 'user-ed', 'review', ['EvE1', 'EvE2', 'EvE3', 'EvE4']),
  ...centralSettings('pillar-env', 'user-ed', 'actions', ['EvE1', 'EvE2']),
  ...centralSettings('pillar-ir', 'user-sergio', 'review', ['SRE1', 'SRE2', 'SRE3', 'SRE4']),
  ...centralSettings('pillar-ir', 'user-sergio', 'rootCause', ['SRE1', 'SRE2']),
  ...centralSettings('pillar-ih', 'user-ludovic', 'review', ['OH-RESP', 'OH-SKIN', 'OH-MSD', 'OH-HEAR']),
];
