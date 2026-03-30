import { ComplaintDraft, DynamicAnswers } from '../types/denuncia';

const DB_NAME = 'complaint-drafts-db';
const STORE_NAME = 'complaint-drafts';
const DB_VERSION = 1;

export interface PersistedComplaintDraft {
  address: ComplaintDraft['address'];
  dynamicAnswers: DynamicAnswers;
}

const isIndexedDbAvailable = (): boolean => typeof window !== 'undefined' && 'indexedDB' in window;

const openDatabase = async (): Promise<IDBDatabase | null> => {
  if (!isIndexedDbAvailable()) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const withStore = async <T,>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> => {
  const database = await openDatabase();

  if (!database) {
    return undefined;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
};

const buildDraftKey = (professionId: number): string => `profession:${professionId}`;

export const getPersistedComplaintDraft = async (
  professionId: number
): Promise<PersistedComplaintDraft | null> => {
  const result = await withStore<PersistedComplaintDraft | null>(
    'readonly',
    (store) => store.get(buildDraftKey(professionId))
  );

  return result ?? null;
};

export const savePersistedComplaintDraft = async (
  professionId: number,
  draft: PersistedComplaintDraft
): Promise<void> => {
  await withStore('readwrite', (store) => store.put(draft, buildDraftKey(professionId)));
};

export const deletePersistedComplaintDraft = async (professionId: number): Promise<void> => {
  await withStore('readwrite', (store) => store.delete(buildDraftKey(professionId)));
};
