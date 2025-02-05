import { openDB, IDBPDatabase } from "idb";

interface Question {
  question: string;
  answers: string[];
  correct: string;
}

interface QuestionCache {
  id: string;
  questions: Question[];
  timestamp: number;
}

const DB_NAME = "question-cache";
const STORE_NAME = "questions";
const CACHE_VERSION = 1;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class QuestionCacheManager {
  private db: IDBPDatabase | null = null;

  async init() {
    this.db = await openDB(DB_NAME, CACHE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }

  async cacheQuestions(questions: Question[]) {
    if (!this.db) await this.init();

    const cache: QuestionCache = {
      id: "questions",
      questions,
      timestamp: Date.now(),
    };

    await this.db!.put(STORE_NAME, cache);
  }

  async getCachedQuestions(): Promise<Question[] | null> {
    if (!this.db) await this.init();

    const cache = await this.db!.get(STORE_NAME, "questions");

    if (!cache) return null;

    // Check if cache is expired
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      await this.db!.delete(STORE_NAME, "questions");
      return null;
    }

    return cache.questions;
  }

  async clearCache() {
    if (!this.db) await this.init();
    await this.db!.clear(STORE_NAME);
  }
}

export const questionCache = new QuestionCacheManager();
