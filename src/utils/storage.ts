import { Session } from "../types";

const DB_NAME = "quiz-app";
const STORE_NAME = "sessions";
const DB_VERSION = 1;

export const storage = {
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  },

  async saveSessions(sessions: Session[], currentSessionId?: string | null) {
    const db = await this.init();
    return new Promise<void>((resolve, reject) => {
      const transaction = (db as IDBDatabase).transaction(
        STORE_NAME,
        "readwrite"
      );
      const store = transaction.objectStore(STORE_NAME);

      const data = {
        sessions,
        currentSessionId,
        lastUpdated: new Date().toISOString(),
      };

      const request = store.put(data, "sessionData");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async loadSessions(): Promise<{
    sessions: Session[];
    currentSessionId: string | null;
  }> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = (db as IDBDatabase).transaction(
        STORE_NAME,
        "readonly"
      );
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("sessionData");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          const { sessions, currentSessionId } = request.result;
          resolve({ sessions, currentSessionId });
        } else {
          resolve({ sessions: [], currentSessionId: null });
        }
      };
    });
  },
};
