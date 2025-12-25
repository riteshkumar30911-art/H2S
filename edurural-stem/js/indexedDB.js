/**
 * IndexedDB Module
 * Handles offline storage for lessons, quizzes, and student progress
 */

const DB_NAME = 'EduRuralSTEM';
const DB_VERSION = 1;

export class IndexedDBService {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    /**
     * Initialize IndexedDB database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.initialized = true;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('lessons')) {
                    const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
                    lessonStore.createIndex('subject', 'subject', { unique: false });
                }

                if (!db.objectStoreNames.contains('quizzes')) {
                    const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
                    quizStore.createIndex('lessonId', 'lessonId', { unique: false });
                }

                if (!db.objectStoreNames.contains('quizResults')) {
                    const resultsStore = db.createObjectStore('quizResults', { keyPath: 'id' });
                    resultsStore.createIndex('studentId', 'studentId', { unique: false });
                    resultsStore.createIndex('lessonId', 'lessonId', { unique: false });
                    resultsStore.createIndex('synced', 'synced', { unique: false });
                }

                if (!db.objectStoreNames.contains('studentProgress')) {
                    const progressStore = db.createObjectStore('studentProgress', { keyPath: 'studentId' });
                    progressStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                }

                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                console.log('Object stores created');
            };
        });
    }

    /**
     * Add or update lesson
     */
    async addLesson(lesson) {
        const transaction = this.db.transaction(['lessons'], 'readwrite');
        const store = transaction.objectStore('lessons');
        return new Promise((resolve, reject) => {
            const request = store.put(lesson);
            request.onsuccess = () => resolve(lesson);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get lesson by ID
     */
    async getLesson(id) {
        const transaction = this.db.transaction(['lessons'], 'readonly');
        const store = transaction.objectStore('lessons');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all lessons by subject
     */
    async getLessonsBySubject(subject) {
        const transaction = this.db.transaction(['lessons'], 'readonly');
        const store = transaction.objectStore('lessons');
        const index = store.index('subject');
        return new Promise((resolve, reject) => {
            const request = index.getAll(subject);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all lessons
     */
    async getAllLessons() {
        const transaction = this.db.transaction(['lessons'], 'readonly');
        const store = transaction.objectStore('lessons');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Add quiz
     */
    async addQuiz(quiz) {
        const transaction = this.db.transaction(['quizzes'], 'readwrite');
        const store = transaction.objectStore('quizzes');
        return new Promise((resolve, reject) => {
            const request = store.put(quiz);
            request.onsuccess = () => resolve(quiz);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get quiz by lesson ID
     */
    async getQuizByLessonId(lessonId) {
        const transaction = this.db.transaction(['quizzes'], 'readonly');
        const store = transaction.objectStore('quizzes');
        const index = store.index('lessonId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(lessonId);
            request.onsuccess = () => resolve(request.result[0]);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Save quiz result
     */
    async saveQuizResult(result) {
        const transaction = this.db.transaction(['quizResults'], 'readwrite');
        const store = transaction.objectStore('quizResults');
        
        const resultWithId = {
            ...result,
            id: `${result.studentId}_${result.lessonId}_${Date.now()}`,
            synced: false,
            timestamp: new Date()
        };

        return new Promise((resolve, reject) => {
            const request = store.put(resultWithId);
            request.onsuccess = () => resolve(resultWithId);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get quiz results for student
     */
    async getStudentQuizResults(studentId) {
        const transaction = this.db.transaction(['quizResults'], 'readonly');
        const store = transaction.objectStore('quizResults');
        const index = store.index('studentId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(studentId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get unsync quiz results
     */
    async getUnsyncedResults() {
        const transaction = this.db.transaction(['quizResults'], 'readonly');
        const store = transaction.objectStore('quizResults');
        const index = store.index('synced');
        return new Promise((resolve, reject) => {
            const request = index.getAll(false);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Mark result as synced
     */
    async markResultAsSynced(resultId) {
        const transaction = this.db.transaction(['quizResults'], 'readwrite');
        const store = transaction.objectStore('quizResults');
        return new Promise((resolve, reject) => {
            const getRequest = store.get(resultId);
            getRequest.onsuccess = () => {
                const result = getRequest.result;
                result.synced = true;
                const updateRequest = store.put(result);
                updateRequest.onsuccess = () => resolve(result);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Update student progress
     */
    async updateStudentProgress(studentId, progress) {
        const transaction = this.db.transaction(['studentProgress'], 'readwrite');
        const store = transaction.objectStore('studentProgress');
        
        const progressData = {
            studentId,
            ...progress,
            lastUpdated: new Date()
        };

        return new Promise((resolve, reject) => {
            const request = store.put(progressData);
            request.onsuccess = () => resolve(progressData);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get student progress
     */
    async getStudentProgress(studentId) {
        const transaction = this.db.transaction(['studentProgress'], 'readonly');
        const store = transaction.objectStore('studentProgress');
        return new Promise((resolve, reject) => {
            const request = store.get(studentId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Add to sync queue
     */
    async addToSyncQueue(data) {
        const transaction = this.db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        
        const queueItem = {
            data,
            type: 'quiz_result',
            timestamp: new Date(),
            retries: 0
        };

        return new Promise((resolve, reject) => {
            const request = store.add(queueItem);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get sync queue items
     */
    async getSyncQueueItems() {
        const transaction = this.db.transaction(['syncQueue'], 'readonly');
        const store = transaction.objectStore('syncQueue');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove from sync queue
     */
    async removeFromSyncQueue(id) {
        const transaction = this.db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Save setting
     */
    async saveSetting(key, value) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        return new Promise((resolve, reject) => {
            const request = store.put({ key, value });
            request.onsuccess = () => resolve(value);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get setting
     */
    async getSetting(key) {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result?.value);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all data (for testing)
     */
    async clearAll() {
        const stores = ['lessons', 'quizzes', 'quizResults', 'studentProgress', 'syncQueue'];
        
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            store.clear();
        }
    }
}

// Export singleton instance
export const dbService = new IndexedDBService();
