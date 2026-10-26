// Notification rules shared by Event Reporting and the Control Panel (feature 007): the alert
// catalogue, a person's information settings and the Site Admins' submission rules.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import { getPillarIdsForPlant } from './organization.js';

// Alerts that hand the person something to do: always raised (NT-2).
export const WORK_ALERTS = [
  'Event to review',
  'Root cause analysis assigned to you',
  'Action plan ready for validation',
  'Action plan not effective',
];

// Alerts a person can turn off, with the hint of My notifications (NT-4).
export const INFORMATION_ALERTS = [
  { key: 'Event submitted', hint: 'An event is submitted in your plant and pillars.' },
  { key: 'Event reported on your behalf', hint: 'Someone reported an event in your name.' },
  { key: 'Event shared with you', hint: 'Someone shared an event with you.' },
  { key: 'Your event was reviewed', hint: 'An event you reported was reviewed as valid.' },
  { key: 'Event archived', hint: 'An event you reported, that was shared with you or that you could review was archived.' },
  { key: 'Root cause analysis completed', hint: 'The analysis of an event you reported or reviewed was completed.' },
  { key: 'Action plan deployed', hint: 'The action plan of an event you reported or reviewed was deployed.' },
  { key: 'Action plan completed', hint: 'The action plan of an event you reported was completed.' },
  { key: 'Action plan not effective', hint: 'On an event you reported. Plan owners always get it.' },
  { key: 'Event closed', hint: 'An event you reported or that was shared with you was closed.' },
  { key: 'Shared event received', hint: 'A safety lesson was shared with your plant.' },
];

// The order of the lifecycle (NT-3): when one action raises several alerts for one person, the
// latest stage wins (NT-1).
export const STAGE_ORDER = [
  'Event to review',
  'Event submitted',
  'Event reported on your behalf',
  'Event shared with you',
  'Your event was reviewed',
  'Event archived',
  'Root cause analysis assigned to you',
  'Root cause analysis completed',
  'Action plan deployed',
  'Action plan ready for validation',
  'Action plan completed',
  'Action plan not effective',
  'Event closed',
  'Shared event received',
];

export function isInformationAlert(key) {
  return INFORMATION_ALERTS.some((alert) => alert.key === key);
}

// A person's setting for an information alert: no record means on, set by nobody (research R3).
export function settingFor(settings, userId, key) {
  const record = settings.find((item) => item.userId === userId && item.type === key);
  return record ? { on: record.on, setById: record.setById, setAt: record.setAt } : { on: true, setById: null, setAt: null };
}

// The plants whose notifications a person manages: a Site Admin's plants of access (NT-6).
export function managedPlantIds(user) {
  return user?.role === 'Site Admin' ? user.access.map((entry) => entry.plantId) : [];
}

export function canManagePlant(user, plantId) {
  return managedPlantIds(user).includes(plantId);
}

// The person themself, or a Site Admin of one of their plants, changes an information setting;
// work alerts never change (research R7).
export function canChangeSetting(actor, person, key) {
  if (!actor || !person || !isInformationAlert(key)) {
    return false;
  }
  if (actor.id === person.id) {
    return true;
  }
  const plants = managedPlantIds(actor);
  return (person.access || []).some((entry) => plants.includes(entry.plantId));
}

// The people of a plant: everyone with an event role whose access includes it (NT-10).
export function peopleOfPlant(users, plantId) {
  return users.filter((user) => user.role && (user.access || []).some((entry) => entry.plantId === plantId));
}

// Who a rule may name: people with an event role who see the plant and pillar (NT-7).
export function ruleRecipientOptions(users, plantId, pillarId) {
  return users.filter((user) => user.role && getPillarIdsForPlant(user, plantId).includes(pillarId));
}

// The levels of a pillar (disease types for Industrial Hygiene).
export function levelsOfPillar(reference, pillarId) {
  const familyIds = reference.filter((item) => item.list === 'family' && item.pillarId === pillarId).map((item) => item.id);
  return reference.filter((item) => item.list === 'level' && familyIds.includes(item.familyId));
}

export function departmentsOf(organization, plantId) {
  return organization.filter((node) => node.type === 'department' && node.parentId === plantId);
}

// Messages of a rule that cannot be saved, by field (NT-7).
export function validateRule(rule) {
  const errors = {};
  if (!rule.levelCodes?.length) errors.levelCodes = 'Choose at least one level.';
  if (!rule.userIds?.length) errors.userIds = 'Choose at least one person.';
  return errors;
}

// A rule matches an event of its plant and pillar, of one of its levels, in one of its departments
// (or any department when it names none) (NT-9, research R4).
export function ruleMatches(rule, event) {
  return (
    rule.plantId === event.plantId &&
    rule.pillarId === event.pillarId &&
    rule.levelCodes.includes(event.levelCode) &&
    (rule.departmentIds.length === 0 || rule.departmentIds.includes(event.location?.departmentId))
  );
}

export function ruleRecipientIds(rules, event) {
  return [...new Set(rules.filter((rule) => ruleMatches(rule, event)).flatMap((rule) => rule.userIds))];
}

// "Levels: TF1, TF2 · Departments: Logistics · People: Ana Ribeiro" (NT-7).
export function describeRule(rule, { organization, users }) {
  const name = (list, id, field) => list.find((item) => item.id === id)?.[field] ?? id;
  const departments = rule.departmentIds.length
    ? rule.departmentIds.map((id) => name(organization, id, 'name')).join(', ')
    : 'All departments';
  return [
    `Levels: ${rule.levelCodes.join(', ')}`,
    `Departments: ${departments}`,
    `People: ${rule.userIds.map((id) => name(users, id, 'name')).join(', ')}`,
  ].join(' · ');
}

// "Set by Eva Novak on 26 Oct 2026" when someone else made the last change, else null (NT-5).
export function setByLine(setting, personId, users) {
  if (!setting.setById || setting.setById === personId) return null;
  const name = users.find((user) => user.id === setting.setById)?.name ?? 'someone';
  const date = new Date(setting.setAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `Set by ${name} on ${date}`;
}
