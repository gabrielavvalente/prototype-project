// The shared platform database every app reads (research R3, R4; contracts/platform-api.md).
// It is stored once per browser address, so apps opened through the launcher share it.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import { masterValues } from './catalogs.js';
import { allowedValueActions, getList, ownActivation, validateValue } from './masterData.js';
import { getPlantName } from './organization.js';
import { getRole, LEVEL_LABELS } from './permissions.js';
import * as sampleData from './sampleData.js';
import { getAll, getAllByIndex, openDatabase, runTransaction } from './storage.js';
import { cellStateFor, PHASE_LABELS } from './workflow.js';

const DATABASE_NAME = 'platform';
const DATABASE_VERSION = 1;

// Lists that cannot be edited in any app yet: refreshed from the sample data on every start.
const FIXED_STORES = ['users', 'organization', 'reference'];
// Data changed in the Control Panel: seeded once, kept afterwards.
const EDITABLE_STORES = ['workflowSettings', 'masterValues', 'activations', 'audit', 'notifications'];
const STORES = [...FIXED_STORES, ...EDITABLE_STORES, 'meta'];

const INDEXES = {
  workflowSettings: ['pillarId'],
  masterValues: ['listId'],
  activations: ['valueId'],
  audit: ['pillarId'],
  notifications: ['userId'],
};

function createStores(db) {
  for (const name of STORES) {
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
function describeSetting(setting, users) {
  if (!setting) {
    return 'Optional';
  }
  if (setting.phase !== 'review') {
    return 'Required';
  }
  const names = setting.reviewerIds.map((id) => users.find((user) => user.id === id)?.name ?? id);
  return `Required (reviewers: ${names.join(', ')})`;
}

function describeScope(setting, organization) {
  const plants =
    setting.scopeLevel === 'central'
      ? 'all plants'
      : setting.plantIds.map((id) => getPlantName(organization, id)).join(', ');
  return `${LEVEL_LABELS[setting.scopeLevel]} ${plants}`;
}

// Makes a phase Required or Optional at the user's level, or changes its reviewers.
// change = { pillarId, levelCode, phase, required, reviewerIds }. Settings of the user's level made
// by colleagues are changed too (option A); their authors are notified. One transaction writes the
// settings, the audit entries and the notifications.
export async function saveWorkflowSetting(user, { pillarId, levelCode, phase, required, reviewerIds = [] }) {
  const role = getRole(user, pillarId);
  if (phase === 'submission') {
    throw new Error('Submission is always required.');
  }
  if (!role) {
    throw new Error('You have no Control Panel role on this pillar.');
  }
  if (required && phase === 'review' && reviewerIds.length === 0) {
    throw new Error('Choose at least one reviewer.');
  }
  const db = await openPlatform();
  const [settings, platform] = await Promise.all([getWorkflowSettings(pillarId), loadPlatform()]);
  const cell = cellStateFor(user, settings, { pillarId, levelCode, phase });
  if (cell.state === 'locked') {
    throw new Error('A higher level requires this phase; it cannot be changed here.');
  }
  const now = new Date().toISOString();
  const pillar = platform.reference.find((item) => item.id === pillarId);

  // Each changed setting: { before, after } where after is null when the setting is removed.
  const changes = cell.mine.map((setting) => ({
    before: setting,
    after: required ? { ...setting, reviewerIds, authorId: user.id, updatedAt: now } : null,
  }));
  if (required && cell.mine.length === 0) {
    const after = {
      id: newId(),
      pillarId,
      levelCode,
      phase,
      scopeLevel: role.level,
      plantIds: role.plantIds,
      reviewerIds,
      authorId: user.id,
      updatedAt: now,
    };
    changes.push({ before: null, after });
  }

  await runTransaction(db, ['workflowSettings', 'audit', 'notifications'], 'readwrite', (stores) => {
    for (const { before, after } of changes) {
      const setting = after || before;
      if (after) {
        stores.workflowSettings.put(after);
      } else {
        stores.workflowSettings.delete(before.id);
      }
      const beforeText = describeSetting(before, platform.users);
      const afterText = describeSetting(after, platform.users);
      stores.audit.put({
        id: newId(),
        pillarId,
        at: now,
        userId: user.id,
        scopeLevel: setting.scopeLevel,
        plantIds: setting.plantIds,
        subject: 'workflow',
        targetId: `${levelCode} · ${PHASE_LABELS[phase]}`,
        action: !after ? 'optional' : !before ? 'required' : 'reviewers',
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
            `${user.name} changed your ${PHASE_LABELS[phase]} setting for ${levelCode} ` +
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

function describeValue(value) {
  return [value.code, value.name, value.description].filter(Boolean).join(' · ');
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
