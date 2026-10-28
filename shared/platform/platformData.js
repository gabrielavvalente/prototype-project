// The shared platform database every app reads (research R3, R4; contracts/platform-api.md).
// It is stored once per browser address, so apps opened through the launcher share it.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import { masterValues } from './catalogs.js';
import { allowedValueActions, getList, ownActivation, planImport, validateValue } from './masterData.js';
import { canChangeSetting, canManagePlant, describeRule, settingFor, validateRule } from './notifications.js';
import { getPillarIdsForPlant, getPlantName } from './organization.js';
import { getRole, LEVEL_LABELS } from './permissions.js';
import * as sampleData from './sampleData.js';
import { getAll, getAllByIndex, openDatabase, runTransaction } from './storage.js';
import { analysisWithoutReview, canChooseReviewers, cellStateFor, levelLabel, ownReviewerChoices, REVIEWERS, SETTING_LABELS } from './workflow.js';

const DATABASE_NAME = 'platform';
// Version 2 adds the notification stores (007); the upgrade only creates missing stores.
const DATABASE_VERSION = 2;

// Lists that cannot be edited in any app yet: refreshed from the sample data on every start.
const FIXED_STORES = ['users', 'organization', 'reference'];
// Data changed in the Control Panel: seeded once, kept afterwards.
const EDITABLE_STORES = [
  'workflowSettings',
  'masterValues',
  'activations',
  'audit',
  'notifications',
  'notificationSettings',
  'notificationRules',
  'notificationChanges',
];
const STORES = [...FIXED_STORES, ...EDITABLE_STORES, 'meta'];

const INDEXES = {
  workflowSettings: ['pillarId'],
  masterValues: ['listId'],
  activations: ['valueId'],
  audit: ['pillarId'],
  notifications: ['userId'],
  notificationSettings: ['userId'],
  notificationRules: ['plantId'],
  notificationChanges: ['plantId'],
};

// Creates the stores a browser does not have yet, so an upgrade keeps the data (007 research R1).
function createStores(db) {
  for (const name of STORES) {
    if (db.objectStoreNames.contains(name)) continue;
    const store = db.createObjectStore(name, { keyPath: name === 'meta' ? 'key' : 'id' });
    for (const field of INDEXES[name] || []) {
      store.createIndex(field, field);
    }
  }
}

// Editable data loaded once per list; a "seeded-<list>" mark in meta remembers it, so lists added
// later (like master data) are still loaded in a browser that already has the others.
const SEEDED_LISTS = {
  workflowSettings: sampleData.workflowSettings,
  masterValues,
};

async function seedPlatform(db) {
  const marks = await getAll(db, 'meta');
  // "seededAt" is the mark of the first version, which seeded the workflow settings only.
  const isSeeded = (name) =>
    marks.some((mark) => mark.key === `seeded-${name}` || (name === 'workflowSettings' && mark.key === 'seededAt'));
  await runTransaction(db, STORES, 'readwrite', (stores) => {
    for (const name of FIXED_STORES) {
      stores[name].clear();
      sampleData[name].forEach((item) => stores[name].put(item));
    }
    for (const [name, items] of Object.entries(SEEDED_LISTS)) {
      if (!isSeeded(name)) {
        items.forEach((item) => stores[name].put(item));
        stores.meta.put({ key: `seeded-${name}`, value: new Date().toISOString() });
      }
    }
  });
}

let databasePromise = null;

// Opens the platform database, creating it and loading the demo data when needed.
export function openPlatform() {
  if (!databasePromise) {
    databasePromise = openDatabase(DATABASE_NAME, DATABASE_VERSION, createStores).then(async (db) => {
      await seedPlatform(db);
      return db;
    });
  }
  return databasePromise;
}

// What every app needs at start.
export async function loadPlatform() {
  const db = await openPlatform();
  const [users, organization, reference] = await Promise.all(FIXED_STORES.map((name) => getAll(db, name)));
  return { users, organization, reference };
}

// Deletes every Control Panel change and loads the demo data again.
export async function resetPlatformData() {
  const db = await openPlatform();
  await runTransaction(db, STORES, 'readwrite', (stores) => {
    STORES.forEach((name) => stores[name].clear());
  });
  await seedPlatform(db);
}

function newId() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Workflow settings (FR-006 to FR-010, FR-022, FR-023)
// ---------------------------------------------------------------------------

export async function getWorkflowSettings(pillarId) {
  const db = await openPlatform();
  if (pillarId) {
    return getAllByIndex(db, 'workflowSettings', 'pillarId', pillarId);
  }
  return getAll(db, 'workflowSettings');
}

// Readable value of a cell for the audit trail and notifications.
function describeSetting(setting, users, phase) {
  const names = (setting?.reviewerIds || []).map((id) => users.find((user) => user.id === id)?.name ?? id);
  // A reviewers choice reads as its names (013 WF-12).
  if (phase === REVIEWERS) {
    return names.length ? names.join(', ') : 'No reviewers';
  }
  if (!setting) {
    return 'Optional';
  }
  return setting.phase === 'review' && names.length ? `Required (reviewers: ${names.join(', ')})` : 'Required';
}

function describeScope(setting, organization) {
  const plants =
    setting.scopeLevel === 'central'
      ? 'all plants'
      : setting.plantIds.map((id) => getPlantName(organization, id)).join(', ');
  return `${LEVEL_LABELS[setting.scopeLevel]} ${plants}`;
}

// Makes a phase Required or Optional at the user's level. change = { pillarId, levelCode, phase,
// required }; Review no longer carries reviewers (013 WF-6). Settings of the user's level made by
// colleagues are changed too (option A); their authors are notified. One transaction writes the
// settings, the audit entries and the notifications.
export async function saveWorkflowSetting(user, { pillarId, levelCode, phase, required }) {
  const role = getRole(user, pillarId);
  if (phase === 'submission') {
    throw new Error('Submission is always required.');
  }
  if (!role) {
    throw new Error('You have no Control Panel role on this pillar.');
  }
  const db = await openPlatform();
  const [settings, platform] = await Promise.all([getWorkflowSettings(pillarId), loadPlatform()]);
  const cell = cellStateFor(user, settings, { pillarId, levelCode, phase });
  if (cell.state === 'locked') {
    throw new Error('A higher level requires this phase; it cannot be changed here.');
  }
  const now = new Date().toISOString();

  // Each changed setting: { before, after } where after is null when the setting is removed.
  const changes = cell.mine.map((setting) => ({
    before: setting,
    after: required ? { ...setting, authorId: user.id, updatedAt: now } : null,
  }));
  if (required && cell.mine.length === 0) {
    const after = {
      id: newId(),
      pillarId,
      levelCode,
      phase,
      scopeLevel: role.level,
      plantIds: role.plantIds,
      reviewerIds: [],
      authorId: user.id,
      updatedAt: now,
    };
    changes.push({ before: null, after });
  }

  // Root cause analysis needs Review at the same plants: refuse a change that would break it.
  const removedIds = changes.filter((change) => change.before).map((change) => change.before.id);
  const next = [...settings.filter((item) => !removedIds.includes(item.id)), ...changes.map((change) => change.after).filter(Boolean)];
  const plantIds = platform.organization.filter((node) => node.type === 'plant').map((node) => node.id);
  const broken = analysisWithoutReview(next, plantIds).filter((item) => item.levelCode === levelCode);
  if (broken.length > 0) {
    const plants = broken.map((item) => getPlantName(platform.organization, item.plantId)).join(', ');
    throw new Error(
      phase === 'review'
        ? `Review stays Required for ${levelCode}: Root cause analysis is required at ${plants} and needs a review.`
        : `Make Review Required for ${levelCode} first: Root cause analysis needs a review (missing at ${plants}).`,
    );
  }

  await writeSettingChanges(db, user, platform, { pillarId, levelCode, phase }, changes, now);
}

// The reviewers the user's level chooses for its plants on one level row, added to those of the
// other levels (013 WF-6a). An empty choice removes it. Colleagues of the same level are notified.
export async function saveReviewers(user, { pillarId, levelCode, reviewerIds }) {
  const role = getRole(user, pillarId);
  if (!role) {
    throw new Error('You have no Control Panel role on this pillar.');
  }
  const db = await openPlatform();
  const [settings, platform] = await Promise.all([getWorkflowSettings(pillarId), loadPlatform()]);
  if (!canChooseReviewers(user, settings, { pillarId, levelCode })) {
    throw new Error('Review is not Required for your plants on this level.');
  }
  const now = new Date().toISOString();
  const mine = ownReviewerChoices(user, settings, { pillarId, levelCode });
  const keep = reviewerIds.length > 0;
  const changes = mine.map((setting) => ({ before: setting, after: keep ? { ...setting, reviewerIds, authorId: user.id, updatedAt: now } : null }));
  if (keep && mine.length === 0) {
    changes.push({
      before: null,
      after: { id: newId(), pillarId, levelCode, phase: REVIEWERS, scopeLevel: role.level, plantIds: role.plantIds, reviewerIds, authorId: user.id, updatedAt: now },
    });
  }
  await writeSettingChanges(db, user, platform, { pillarId, levelCode, phase: REVIEWERS }, changes, now);
}

// Writes setting changes with their audit entries and the notifications to colleagues, at once.
function writeSettingChanges(db, user, platform, { pillarId, levelCode, phase }, changes, now) {
  const pillar = platform.reference.find((item) => item.id === pillarId);
  return runTransaction(db, ['workflowSettings', 'audit', 'notifications'], 'readwrite', (stores) => {
    for (const { before, after } of changes) {
      const setting = after || before;
      if (after) {
        stores.workflowSettings.put(after);
      } else {
        stores.workflowSettings.delete(before.id);
      }
      const beforeText = describeSetting(before, platform.users, phase);
      const afterText = describeSetting(after, platform.users, phase);
      stores.audit.put({
        id: newId(),
        pillarId,
        at: now,
        userId: user.id,
        scopeLevel: setting.scopeLevel,
        plantIds: setting.plantIds,
        subject: 'workflow',
        targetId: `${levelLabel(pillarId, levelCode)} · ${SETTING_LABELS[phase]}`,
        action: phase === REVIEWERS ? 'reviewers' : !after ? 'optional' : !before ? 'required' : 'reviewers',
        before: beforeText,
        after: afterText,
      });
      if (before && before.authorId !== user.id) {
        stores.notifications.put({
          id: newId(),
          userId: before.authorId,
          at: now,
          read: false,
          pillarId,
          settingId: setting.id,
          text:
            `${user.name} changed your ${SETTING_LABELS[phase]} setting for ${levelLabel(pillarId, levelCode)} ` +
            `(${pillar.label}, ${describeScope(setting, platform.organization)}): ${beforeText} → ${afterText}.`,
        });
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Control Panel notifications (FR-023)
// ---------------------------------------------------------------------------

export async function getNotifications(userId) {
  const db = await openPlatform();
  const items = await getAllByIndex(db, 'notifications', 'userId', userId);
  return items.sort((a, b) => b.at.localeCompare(a.at));
}

export async function markNotificationsRead(userId) {
  const db = await openPlatform();
  const items = await getAllByIndex(db, 'notifications', 'userId', userId);
  await runTransaction(db, ['notifications'], 'readwrite', (stores) => {
    items.filter((item) => !item.read).forEach((item) => stores.notifications.put({ ...item, read: true }));
  });
}

// ---------------------------------------------------------------------------
// Master data (FR-015 to FR-020, FR-022)
// ---------------------------------------------------------------------------

// Every value and activation choice: the lists are small, and Body Parts need their categories.
export async function getMasterData() {
  const db = await openPlatform();
  const [values, activations] = await Promise.all([getAll(db, 'masterValues'), getAll(db, 'activations')]);
  return { values, activations };
}

function auditEntry(user, list, value, action, before, after) {
  const role = getRole(user, list.pillarId);
  return {
    id: newId(),
    pillarId: list.pillarId,
    at: new Date().toISOString(),
    userId: user.id,
    scopeLevel: role.level,
    plantIds: role.plantIds,
    subject: list.id,
    targetId: value.code ? `${value.code} — ${value.name}` : value.name,
    action,
    before,
    after,
  };
}

// An injury also shows how many body parts it is offered for (012 MD-4).
function describeValue(value) {
  const parts = value.bodyPartIds ? `${value.bodyPartIds.length} body part${value.bodyPartIds.length === 1 ? '' : 's'}` : '';
  return [value.code, value.name, value.description, parts].filter(Boolean).join(' · ');
}

// Adds a value (value.id empty) or saves changes to one. Throws with the validation messages
// joined when the value is not valid.
export async function saveValue(user, listId, changes) {
  const list = getList(listId);
  const role = getRole(user, list.pillarId);
  const { values, activations } = await getMasterData();
  const { id, ...fields } = changes;
  const existing = id ? values.find((item) => item.id === id) : null;
  const allowed = allowedValueActions(user, list, existing || null, activations);
  if (existing ? !allowed.edit : !allowed.add) {
    throw new Error('You are not allowed to change this list.');
  }
  const now = new Date().toISOString();
  const value = existing
    ? { ...existing, ...fields, updatedBy: user.id, updatedAt: now }
    : {
        id: newId(),
        listId,
        code: '',
        description: '',
        parentId: '',
        ...(list.linkedListId ? { bodyPartIds: [] } : {}),
        ...fields,
        ownerLevel: role.level,
        ownerPlantIds: role.level === 'central' ? [] : role.plantIds,
        status: 'Active',
        createdBy: user.id,
        createdAt: now,
        updatedBy: user.id,
        updatedAt: now,
      };
  const errors = validateValue(list, value, values);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).join(' '));
  }
  const db = await openPlatform();
  await runTransaction(db, ['masterValues', 'audit'], 'readwrite', (stores) => {
    stores.masterValues.put(value);
    stores.audit.put(
      auditEntry(user, list, value, existing ? 'edit' : 'add', existing ? describeValue(existing) : '—', describeValue(value)),
    );
  });
  return value;
}

// Adds and changes the values of an imported file in one transaction, or nothing when a row has a
// problem (review 2026-10-25). rows as read by parseCsv. Returns the plan of planImport.
export async function importValues(user, listId, rows) {
  const list = getList(listId);
  if (!allowedValueActions(user, list, null).add) {
    throw new Error('You are not allowed to import values into this list.');
  }
  const { values } = await getMasterData();
  const plan = planImport(user, list, rows, values);
  if (plan.errors.length > 0 || plan.changes.length === 0) {
    return plan;
  }
  const now = new Date().toISOString();
  const db = await openPlatform();
  await runTransaction(db, ['masterValues', 'audit'], 'readwrite', (stores) => {
    for (const { before, after } of plan.changes) {
      const value = before
        ? { ...after, updatedBy: user.id, updatedAt: now }
        : { ...after, createdBy: user.id, createdAt: now, updatedBy: user.id, updatedAt: now };
      stores.masterValues.put(value);
      stores.audit.put(
        auditEntry(user, list, value, before ? 'edit' : 'add', before ? describeValue(before) : '—', describeValue(value)),
      );
    }
  });
  return plan;
}

// The owner changes a value's status: Active ⇄ Inactive, or Retired (final).
export async function setValueStatus(user, listId, valueId, status) {
  const list = getList(listId);
  const { values, activations } = await getMasterData();
  const value = values.find((item) => item.id === valueId);
  const allowed = allowedValueActions(user, list, value, activations);
  const permitted = { Active: allowed.reactivate, Inactive: allowed.deactivate, Retired: allowed.retire }[status];
  if (!permitted) {
    throw new Error('You are not allowed to change the status of this value.');
  }
  const updated = { ...value, status, updatedBy: user.id, updatedAt: new Date().toISOString() };
  // A Body Part cannot become active while its category is not active (FR-020).
  if (status === 'Active') {
    const errors = validateValue(list, updated, values);
    if (errors.parentId) {
      throw new Error(errors.parentId);
    }
  }
  const action = { Active: 'reactivate', Inactive: 'deactivate', Retired: 'retire' }[status];
  const db = await openPlatform();
  await runTransaction(db, ['masterValues', 'audit'], 'readwrite', (stores) => {
    stores.masterValues.put(updated);
    stores.audit.put(auditEntry(user, list, value, action, value.status, status));
  });
}

// Someone who does not own a value switches it off (or back on) for their own plants.
export async function setActivation(user, listId, valueId, active) {
  const list = getList(listId);
  const role = getRole(user, list.pillarId);
  const { values, activations } = await getMasterData();
  const value = values.find((item) => item.id === valueId);
  const allowed = allowedValueActions(user, list, value, activations);
  if (active ? !allowed.reactivateHere : !allowed.deactivateHere) {
    throw new Error('You are not allowed to change this value for your plants.');
  }
  const scope = `${LEVEL_LABELS[role.level]} level`;
  const db = await openPlatform();
  await runTransaction(db, ['activations', 'audit'], 'readwrite', (stores) => {
    if (active) {
      stores.activations.delete(ownActivation(user, list, value, activations).id);
    } else {
      stores.activations.put({
        id: newId(),
        valueId,
        scopeLevel: role.level,
        plantIds: role.plantIds,
        authorId: user.id,
        createdAt: new Date().toISOString(),
      });
    }
    const before = active ? `Deactivated at ${scope}` : `Active at ${scope}`;
    const after = active ? `Active at ${scope}` : `Deactivated at ${scope}`;
    stores.audit.put(auditEntry(user, list, value, active ? 'reactivate' : 'deactivate', before, after));
  });
}

// ---------------------------------------------------------------------------
// Audit trail (FR-022)
// ---------------------------------------------------------------------------

export async function getAudit(pillarId) {
  const db = await openPlatform();
  const entries = await getAllByIndex(db, 'audit', 'pillarId', pillarId);
  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

// ---------------------------------------------------------------------------
// Notification settings (feature 007, NT-5 to NT-11)
// ---------------------------------------------------------------------------

// The information settings that were changed, for some people (all when userIds is omitted).
export async function getNotificationSettings(userIds) {
  const db = await openPlatform();
  const settings = await getAll(db, 'notificationSettings');
  return userIds ? settings.filter((item) => userIds.includes(item.userId)) : settings;
}

export async function getNotificationRules(plantId) {
  const db = await openPlatform();
  return getAllByIndex(db, 'notificationRules', 'plantId', plantId);
}

export async function getNotificationChanges(plantId) {
  const db = await openPlatform();
  const changes = await getAllByIndex(db, 'notificationChanges', 'plantId', plantId);
  return changes.sort((a, b) => b.at.localeCompare(a.at));
}

function settingRecord(userId, type, on, actorId, at) {
  return { id: `${userId}|${type}`, userId, type, on, setById: actorId, setAt: at };
}

function changeEntry(plantId, actor, what, action, before, after, at) {
  return { id: newId(), plantId, at, userId: actor.id, what, action, before, after };
}

const onOff = (on) => (on ? 'On' : 'Off');

// The person or a Site Admin turns an information alert on or off; the latest change wins (NT-5).
// A Site Admin's change (from the page of plantId) is saved with its Changes entry (NT-11).
export async function setNotificationSetting(actor, userId, type, on, plantId = null) {
  const { users } = await loadPlatform();
  const person = users.find((user) => user.id === userId);
  const byAdmin = actor.id !== userId;
  if (!canChangeSetting(actor, person, type) || (byAdmin && !canManagePlant(actor, plantId))) {
    throw new Error('You are not allowed to change this setting.');
  }
  const before = settingFor(await getNotificationSettings([userId]), userId, type);
  const now = new Date().toISOString();
  const db = await openPlatform();
  await runTransaction(db, ['notificationSettings', 'notificationChanges'], 'readwrite', (stores) => {
    stores.notificationSettings.put(settingRecord(userId, type, on, actor.id, now));
    if (byAdmin) {
      stores.notificationChanges.put(
        changeEntry(plantId, actor, `${person.name} · ${type}`, on ? 'Turned on' : 'Turned off', onOff(before.on), onOff(on), now),
      );
    }
  });
}

function checkRuleRights(user, plantId, pillarId) {
  if (!canManagePlant(user, plantId) || !getPillarIdsForPlant(user, plantId).includes(pillarId)) {
    throw new Error('You are not allowed to change the notifications of this plant.');
  }
}

// Adds (rule.id empty) or saves a submission rule; people added to it get "Event submitted" turned
// on (NT-7, NT-8). Throws with the validation messages joined when the rule is not valid.
export async function saveNotificationRule(user, rule) {
  checkRuleRights(user, rule.plantId, rule.pillarId);
  const errors = validateRule(rule);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).join(' '));
  }
  const platform = await loadPlatform();
  const existing = rule.id ? (await getNotificationRules(rule.plantId)).find((item) => item.id === rule.id) : null;
  const now = new Date().toISOString();
  const saved = { ...rule, id: rule.id || newId(), departmentIds: rule.departmentIds || [], authorId: user.id, updatedAt: now };
  const added = saved.userIds.filter((id) => !existing?.userIds.includes(id));
  const settings = await getNotificationSettings(added);
  const pillar = platform.reference.find((item) => item.id === rule.pillarId);
  const db = await openPlatform();
  await runTransaction(db, ['notificationRules', 'notificationSettings', 'notificationChanges'], 'readwrite', (stores) => {
    stores.notificationRules.put(saved);
    stores.notificationChanges.put(
      changeEntry(
        rule.plantId,
        user,
        `${pillar.label} rule`,
        existing ? 'Edited' : 'Added',
        existing ? describeRule(existing, platform) : '—',
        describeRule(saved, platform),
        now,
      ),
    );
    for (const userId of added) {
      const before = settingFor(settings, userId, 'Event submitted');
      stores.notificationSettings.put(settingRecord(userId, 'Event submitted', true, user.id, now));
      if (!before.on) {
        const name = platform.users.find((item) => item.id === userId)?.name ?? userId;
        stores.notificationChanges.put(changeEntry(rule.plantId, user, `${name} · Event submitted`, 'Turned on', 'Off', 'On', now));
      }
    }
  });
  return saved;
}

export async function deleteNotificationRule(user, plantId, ruleId) {
  const rule = (await getNotificationRules(plantId)).find((item) => item.id === ruleId);
  if (!rule) return;
  checkRuleRights(user, plantId, rule.pillarId);
  const platform = await loadPlatform();
  const pillar = platform.reference.find((item) => item.id === rule.pillarId);
  const now = new Date().toISOString();
  const db = await openPlatform();
  await runTransaction(db, ['notificationRules', 'notificationChanges'], 'readwrite', (stores) => {
    stores.notificationRules.delete(ruleId);
    stores.notificationChanges.put(changeEntry(plantId, user, `${pillar.label} rule`, 'Deleted', describeRule(rule, platform), '—', now));
  });
}
