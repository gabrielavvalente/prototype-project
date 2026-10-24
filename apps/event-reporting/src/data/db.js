// Browser database (IndexedDB) for the app, see data-model.md and research R2.

import { openDB } from 'idb';
import * as sampleData from './sampleData.js';

const DATABASE_NAME = 'event-reporting';
const DATABASE_VERSION = 1;

const STORES = [
  'events',
  'attachments',
  'alerts',
  'users',
  'organization',
  'reference',
  'counters',
  'settings',
];

// Thrown when the browser has no space left to save data (e.g. too many videos).
export class StorageFullError extends Error {
  constructor() {
    super('Device storage is full. Remove attachments and try again.');
    this.name = 'StorageFullError';
  }
}

let databasePromise = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(db) {
        const stores = {};
        for (const name of STORES) {
          stores[name] = db.createObjectStore(name, { keyPath: 'id' });
        }
        stores.events.createIndex('plantId', 'plantId');
        stores.events.createIndex('status', 'status');
        stores.events.createIndex('reporterId', 'reporterId');
        // Drafts have no record number; IndexedDB leaves null keys out of the index.
        stores.events.createIndex('recordNumber', 'recordNumber', { unique: true });
        stores.attachments.createIndex('eventId', 'eventId');
        stores.alerts.createIndex('recipientId', 'recipientId');
        stores.organization.createIndex('parentId', 'parentId');
      },
    });
  }
  return databasePromise;
}

// Runs a database write and turns "no space left" into a StorageFullError.
async function withStorageCheck(work) {
  try {
    return await work();
  } catch (error) {
    if (error && error.name === 'QuotaExceededError') {
      throw new StorageFullError();
    }
    throw error;
  }
}

export function newId() {
  return crypto.randomUUID();
}

export async function getAll(storeName) {
  const db = await getDatabase();
  return db.getAll(storeName);
}

export async function getById(storeName, id) {
  const db = await getDatabase();
  return db.get(storeName, id);
}

export async function getByIndex(storeName, indexName, value) {
  const db = await getDatabase();
  return db.getAllFromIndex(storeName, indexName, value);
}

export async function put(storeName, item) {
  const db = await getDatabase();
  return withStorageCheck(() => db.put(storeName, item));
}

async function loadSampleData() {
  const db = await getDatabase();
  const tx = db.transaction(STORES, 'readwrite');
  const stores = {
    users: sampleData.users,
    organization: sampleData.organization,
    reference: sampleData.reference,
    events: sampleData.events,
    counters: sampleData.counters,
    alerts: sampleData.alerts,
  };
  for (const [storeName, items] of Object.entries(stores)) {
    for (const item of items) {
      tx.objectStore(storeName).put(item);
    }
  }
  await tx.done;
}

// Loads the sample data the first time the app opens.
export async function seedIfEmpty() {
  const db = await getDatabase();
  const userCount = await db.count('users');
  if (userCount === 0) {
    await loadSampleData();
  }
}

// Deletes everything (including reported events) and loads the sample data again.
export async function resetDemoData() {
  const db = await getDatabase();
  const tx = db.transaction(STORES, 'readwrite');
  for (const name of STORES) {
    tx.objectStore(name).clear();
  }
  await tx.done;
  await loadSampleData();
}
