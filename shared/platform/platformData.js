// The shared platform database every app reads (research R3, R4; contracts/platform-api.md).
// It is stored once per browser address, so apps opened through the launcher share it.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

import * as sampleData from './sampleData.js';
import { getAll, getById, openDatabase, runTransaction } from './storage.js';

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

function seededLists() {
  return { workflowSettings: sampleData.workflowSettings };
}

async function seedPlatform(db) {
  const seeded = await getById(db, 'meta', 'seededAt');
  await runTransaction(db, STORES, 'readwrite', (stores) => {
    for (const name of FIXED_STORES) {
      stores[name].clear();
      sampleData[name].forEach((item) => stores[name].put(item));
    }
    if (!seeded) {
      for (const [name, items] of Object.entries(seededLists())) {
        items.forEach((item) => stores[name].put(item));
      }
      stores.meta.put({ key: 'seededAt', value: new Date().toISOString() });
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
