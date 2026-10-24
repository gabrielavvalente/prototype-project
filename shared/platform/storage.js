// Tiny promise helpers over the browser's built-in IndexedDB (research R2).
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

// Turns an IndexedDB request into a promise of its result.
export function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Opens (and creates or upgrades) a database. upgrade(db, transaction) creates the stores.
export function openDatabase(name, version, upgrade) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = () => upgrade(request.result, request.transaction);
    request.onsuccess = () => {
      const db = request.result;
      // Another app opened a newer version: close so it can upgrade.
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  });
}

export function getAll(db, storeName) {
  return requestToPromise(db.transaction(storeName).objectStore(storeName).getAll());
}

export function getById(db, storeName, id) {
  return requestToPromise(db.transaction(storeName).objectStore(storeName).get(id));
}

export function getAllByIndex(db, storeName, indexName, value) {
  const store = db.transaction(storeName).objectStore(storeName);
  return requestToPromise(store.index(indexName).getAll(value));
}

// Runs work(stores) in one transaction and resolves with its return value once everything is
// saved. stores is { storeName: objectStore }. If work throws, nothing is saved.
export function runTransaction(db, storeNames, mode, work) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames, mode);
    const stores = Object.fromEntries(storeNames.map((name) => [name, transaction.objectStore(name)]));
    let result;
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
    Promise.resolve()
      .then(() => work(stores))
      .then((value) => {
        result = value;
      })
      .catch((error) => {
        transaction.abort();
        reject(error);
      });
  });
}
