const DB_NAME = "toeic_shadowing_audio";
const DB_VERSION = 1;
const STORE_NAME = "segments";

interface AudioRecord {
  key: string;
  sessionId: string;
  segmentIndex: number;
  attemptIndex: number;
  blob: Blob;
  createdAt: number;
}

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("sessionId", "sessionId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const runTransaction = async <T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = callback(store);
    let requestResult: T | undefined;
    let hasRequestResult = false;

    if (request) {
      request.onsuccess = () => {
        requestResult = request.result;
        hasRequestResult = true;
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    }

    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.oncomplete = () => {
      db.close();
      resolve(hasRequestResult ? requestResult : undefined);
    };
  });
};

export const saveShadowingAudioChunk = async (
  sessionId: string,
  segmentIndex: number,
  blob: Blob,
) => {
  const existing = await getShadowingAudioChunks(sessionId);
  const attemptIndex = existing.filter((item) => item.segmentIndex === segmentIndex).length;
  const record: AudioRecord = {
    key: `${sessionId}:${segmentIndex}:${Date.now()}`,
    sessionId,
    segmentIndex,
    attemptIndex,
    blob,
    createdAt: Date.now(),
  };

  await runTransaction("readwrite", (store) => store.put(record));
};

export const getShadowingAudioChunks = async (sessionId: string): Promise<AudioRecord[]> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("sessionId");
    const request = index.getAll(sessionId);

    request.onsuccess = () => {
      const records = (request.result as AudioRecord[]).sort((a, b) => a.createdAt - b.createdAt);
      resolve(records);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
};

export const hasShadowingAudioChunks = async (sessionId: string): Promise<boolean> => {
  const chunks = await getShadowingAudioChunks(sessionId);
  return chunks.length > 0;
};

export const buildShadowingCombinedAudioBlob = async (sessionId: string): Promise<Blob | null> => {
  const chunks = await getShadowingAudioChunks(sessionId);
  if (chunks.length === 0) return null;

  return new Blob(chunks.map((item) => item.blob), { type: chunks[0].blob.type || "audio/webm" });
};

export const clearShadowingAudioChunks = async (sessionId: string) => {
  const chunks = await getShadowingAudioChunks(sessionId);

  await runTransaction("readwrite", (store) => {
    chunks.forEach((item) => store.delete(item.key));
  });
};

export const migrateShadowingAudioChunks = async (fromSessionId: string, toSessionId: string) => {
  if (fromSessionId === toSessionId) return;

  const chunks = await getShadowingAudioChunks(fromSessionId);
  if (chunks.length === 0) return;

  await runTransaction("readwrite", (store) => {
    chunks.forEach((item) => {
      const migrated: AudioRecord = {
        ...item,
        key: `${toSessionId}:${item.segmentIndex}:${item.createdAt}`,
        sessionId: toSessionId,
      };
      store.put(migrated);
      store.delete(item.key);
    });
  });
};
