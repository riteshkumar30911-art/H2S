/**
 * Sync Module
 * Handles offline data synchronization with Firebase when back online
 */

import { firebaseService } from './firebase.js';
import { dbService } from './indexedDB.js';

export class SyncManager {
    constructor() {
        this.isSyncing = false;
        this.syncQueue = [];
        this.initializeSyncListeners();
    }

    /**
     * Initialize sync event listeners
     */
    initializeSyncListeners() {
        // Listen for online event
        window.addEventListener('online', () => {
            console.log('Back online! Starting sync...');
            this.syncOfflineData();
        });

        // Listen for offline event
        window.addEventListener('offline', () => {
            console.log('Gone offline. Data will sync when back online.');
        });

        // Check connection periodically
        setInterval(() => {
            if (navigator.onLine && !this.isSyncing) {
                this.syncOfflineData();
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Sync all offline data when back online
     */
    async syncOfflineData() {
        if (!navigator.onLine || this.isSyncing) {
            return;
        }

        this.isSyncing = true;
        console.log('Starting offline data sync...');

        try {
            // Get unsynced quiz results from IndexedDB
            const unsyncedResults = await dbService.getUnsyncedResults();
            
            if (unsyncedResults.length === 0) {
                console.log('No data to sync');
                this.isSyncing = false;
                return;
            }

            console.log(`Syncing ${unsyncedResults.length} quiz results...`);

            // Sync each result
            for (const result of unsyncedResults) {
                try {
                    const syncResult = await this.syncQuizResult(result);
                    if (syncResult.success) {
                        await dbService.markResultAsSynced(result.id);
                        console.log(`Synced result: ${result.id}`);
                    }
                } catch (error) {
                    console.error(`Error syncing result ${result.id}:`, error);
                }
            }

            // Dispatch sync complete event
            window.dispatchEvent(new CustomEvent('dataSynced', {
                detail: { count: unsyncedResults.length }
            }));

            console.log('Offline data sync completed');
            this.isSyncing = false;
        } catch (error) {
            console.error('Error during sync:', error);
            this.isSyncing = false;
        }
    }

    /**
     * Sync individual quiz result
     */
    async syncQuizResult(result) {
        try {
            const syncResult = await firebaseService.saveQuizResult(
                result.studentId,
                result.lessonId,
                result.score,
                result.answers
            );

            return syncResult;
        } catch (error) {
            console.error('Error syncing quiz result:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            isSyncing: this.isSyncing,
            isOnline: navigator.onLine
        };
    }

    /**
     * Manually trigger sync
     */
    async manualSync() {
        return this.syncOfflineData();
    }
}

// Export singleton instance
export const syncManager = new SyncManager();
