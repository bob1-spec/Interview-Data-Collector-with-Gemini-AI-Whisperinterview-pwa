import type { Questionnaire, Response } from '../types';

const DB_NAME = 'InterviewPWA';
const DB_VERSION = 1;
const QUESTIONNAIRE_STORE = 'questionnaires';
const RESPONSE_STORE = 'responses';

export class IndexedDBService {
  private static db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  static async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create questionnaire store
        if (!db.objectStoreNames.contains(QUESTIONNAIRE_STORE)) {
          db.createObjectStore(QUESTIONNAIRE_STORE, { keyPath: 'id' });
        }

        // Create response store
        if (!db.objectStoreNames.contains(RESPONSE_STORE)) {
          const responseStore = db.createObjectStore(RESPONSE_STORE, { keyPath: 'id' });
          responseStore.createIndex('questionnaireId', 'questionnaireId', { unique: false });
          responseStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * Save questionnaire to IndexedDB
   */
  static async saveQuestionnaire(questionnaire: Questionnaire): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONNAIRE_STORE], 'readwrite');
      const store = transaction.objectStore(QUESTIONNAIRE_STORE);
      const request = store.put(questionnaire);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get questionnaire from IndexedDB
   */
  static async getQuestionnaire(id: string): Promise<Questionnaire | null> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONNAIRE_STORE], 'readonly');
      const store = transaction.objectStore(QUESTIONNAIRE_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all questionnaires from IndexedDB
   */
  static async getAllQuestionnaires(): Promise<Questionnaire[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONNAIRE_STORE], 'readonly');
      const store = transaction.objectStore(QUESTIONNAIRE_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Delete questionnaire from IndexedDB
   */
  static async deleteQuestionnaire(id: string): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONNAIRE_STORE], 'readwrite');
      const store = transaction.objectStore(QUESTIONNAIRE_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Save response to IndexedDB
   */
  static async saveResponse(response: Response): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RESPONSE_STORE], 'readwrite');
      const store = transaction.objectStore(RESPONSE_STORE);
      const request = store.put(response);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get response from IndexedDB
   */
  static async getResponse(id: string): Promise<Response | null> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RESPONSE_STORE], 'readonly');
      const store = transaction.objectStore(RESPONSE_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all responses for a questionnaire
   */
  static async getResponsesByQuestionnaire(questionnaireId: string): Promise<Response[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RESPONSE_STORE], 'readonly');
      const store = transaction.objectStore(RESPONSE_STORE);
      const index = store.index('questionnaireId');
      const request = index.getAll(questionnaireId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Delete response from IndexedDB
   */
  static async deleteResponse(id: string): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RESPONSE_STORE], 'readwrite');
      const store = transaction.objectStore(RESPONSE_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all data from IndexedDB
   */
  static async clearAll(): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONNAIRE_STORE, RESPONSE_STORE], 'readwrite');

      transaction.objectStore(QUESTIONNAIRE_STORE).clear();
      transaction.objectStore(RESPONSE_STORE).clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }
}
