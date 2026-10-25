// Browser database (IndexedDB) for the app, see data-model.md and research R2.

import { openDB } from 'idb';
import { resetPlatformData } from '../../../../shared/platform/platformData.js';
import { getManagersToAlert } from '../logic/access.js';
import { formatRecordNumber, getCounterId } from '../logic/recordNumber.js';
import { completeImmediateActions, getSubmittedStatus } from '../logic/submission.js';
import * as sampleData from './sampleData.js';

const DATABASE_NAME = 'event-reporting';
// Version 2 renamed family codes and record numbers, version 3 renamed HPR to SIP, version 4
// replaced feedback emails with Shared with, version 5 added the person involved and first aid
// (reviews of 2026-10-24), version 6 moved users and the organization to the shared platform data
// (feature 002); older demo data is replaced.
const DATABASE_VERSION = 6;

// "reference" keeps the form lists only; pillars, families and levels are platform data.
const STORES = ['events', 'attachments', 'alerts', 'reference', 'counters', 'settings'];

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
        for (const name of [...db.objectStoreNames]) {
          db.deleteObjectStore(name);
        }
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

// Marks alerts as read (FR-043).
export async function markAlertsRead(alerts) {
  const db = await getDatabase();
  const tx = db.transaction('alerts', 'readwrite');
  const readAt = new Date().toISOString();
  for (const alert of alerts) {
    if (!alert.readAt) {
      tx.store.put({ ...alert, readAt });
    }
  }
  await tx.done;
}

// Finds an event by record number (submitted events) or by internal id (drafts).
export async function findEvent(idOrRecordNumber) {
  const db = await getDatabase();
  const byRecordNumber = await db.getFromIndex('events', 'recordNumber', idOrRecordNumber);
  return byRecordNumber || (await db.get('events', idOrRecordNumber)) || null;
}

// Saves an event and its attachments in one transaction.
// attachments: [{ id, fileName, mimeType, size, blob, isNew }] as kept by the form.
// beforeSave(tx, event, now) may change the event (used by submit) inside the same transaction.
async function writeEvent({ event, attachments, removedAttachmentIds = [], userId }, beforeSave) {
  const db = await getDatabase();
  return withStorageCheck(async () => {
    const tx = db.transaction(['events', 'attachments', 'counters', 'alerts'], 'readwrite');
    const now = new Date().toISOString();
    const saved = {
      ...event,
      immediateActions: completeImmediateActions(event),
      id: event.id || newId(),
      attachmentIds: attachments.map((attachment) => attachment.id),
      createdBy: event.createdBy || userId,
      createdAt: event.createdAt || now,
      updatedBy: userId,
      updatedAt: now,
    };
    if (beforeSave) {
      await beforeSave(tx, saved, now);
    }
    for (const attachment of attachments.filter((item) => item.isNew)) {
      tx.objectStore('attachments').put({
        id: attachment.id,
        eventId: saved.id,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        blob: attachment.blob,
        addedBy: userId,
        addedAt: now,
      });
    }
    for (const id of removedAttachmentIds) {
      tx.objectStore('attachments').delete(id);
    }
    tx.objectStore('events').put(saved);
    await tx.done;
    return saved;
  });
}

// Save as Draft: no record number, nobody is notified (FR-015).
export function saveDraft(args) {
  return writeEvent({ ...args, event: { ...args.event, status: 'Draft', recordNumber: null } });
}

// Saves changes to an already submitted event; its status does not change (FR-034).
export function saveChanges(args) {
  return writeEvent(args);
}

// Submit: gives the next record number, keeps the workflow in force (002 FR-012), sets status Open
// — or Closed when only Submission is required (002 FR-026) — and alerts the Managers and the
// Shared with users (FR-016).
// The counter is read and increased in the same transaction, so two events never share a number.
export function submitEvent({ users, workflow, ...args }) {
  return writeEvent(args, async (tx, event, now) => {
    const counterId = getCounterId(event.familyCode, new Date().getFullYear());
    const counters = tx.objectStore('counters');
    const counter = await counters.get(counterId);
    const sequence = (counter ? counter.lastSequence : 0) + 1;
    counters.put({ id: counterId, lastSequence: sequence });

    event.recordNumber = formatRecordNumber(event.familyCode, new Date().getFullYear(), sequence);
    event.workflow = workflow;
    event.status = getSubmittedStatus(workflow);
    event.submittedAt = now;
    event.closedAt = event.status === 'Closed' ? now : null;

    const managerIds = getManagersToAlert(users, event).map((manager) => manager.id);
    const sharedIds = event.sharedWithIds.filter((id) => !managerIds.includes(id));
    const alerts = [
      ...managerIds.map((recipientId) => ({ recipientId, type: 'Event submitted' })),
      ...sharedIds.map((recipientId) => ({ recipientId, type: 'Event shared with you' })),
    ];
    for (const alert of alerts) {
      tx.objectStore('alerts').put({ id: newId(), ...alert, eventId: event.id, createdAt: now });
    }
  });
}

async function loadSampleData() {
  const db = await getDatabase();
  const tx = db.transaction(STORES, 'readwrite');
  const stores = {
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

// Loads the sample data the first time the app opens. The form lists are refreshed on every
// start, since they cannot be edited in the app.
export async function seedIfEmpty() {
  const db = await getDatabase();
  const listCount = await db.count('reference');
  if (listCount === 0) {
    await loadSampleData();
    return;
  }
  const tx = db.transaction('reference', 'readwrite');
  for (const item of sampleData.reference) {
    tx.store.put(item);
  }
  await tx.done;
}

// Deletes everything (including reported events and Control Panel changes) and loads the sample
// data again.
export async function resetDemoData() {
  await resetPlatformData();
  const db = await getDatabase();
  const tx = db.transaction(STORES, 'readwrite');
  for (const name of STORES) {
    tx.objectStore(name).clear();
  }
  await tx.done;
  await loadSampleData();
}
