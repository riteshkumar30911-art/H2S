/**
 * Firebase Configuration Module
 * Initializes and exports Firebase services for authentication and database
 */

// Firebase configuration - Replace with your own config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (using Firebase SDK)
// Note: For production, use proper Firebase SDK initialization
// This is a placeholder for Firebase integration

export class FirebaseService {
    constructor() {
        this.config = firebaseConfig;
        this.user = null;
        this.isOnline = navigator.onLine;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onOnlineStatusChange?.(true);
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onOnlineStatusChange?.(false);
        });
    }

    /**
     * Authenticate user with email and password
     */
    async loginUser(email, password, role = 'student') {
        try {
            // Mock authentication - replace with real Firebase auth
            // In production: firebase.auth().signInWithEmailAndPassword(email, password)
            
            const mockUser = {
                uid: 'user_' + Date.now(),
                email,
                displayName: email.split('@')[0],
                role,
                createdAt: new Date()
            };

            this.user = mockUser;
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            
            return { success: true, user: mockUser };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign up new user
     */
    async signupUser(email, password, name, role = 'student') {
        try {
            const mockUser = {
                uid: 'user_' + Date.now(),
                email,
                displayName: name,
                role,
                createdAt: new Date()
            };

            this.user = mockUser;
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            
            return { success: true, user: mockUser };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign out current user
     */
    async logoutUser() {
        try {
            this.user = null;
            localStorage.removeItem('currentUser');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        if (this.user) return this.user;
        
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            this.user = JSON.parse(stored);
            return this.user;
        }
        
        return null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    /**
     * Get all students (for teacher dashboard)
     * In production: fetch from Firestore
     */
    async getStudents() {
        try {
            // Mock data - replace with Firestore query
            const students = [
                {
                    id: 'student_1',
                    name: 'Aarav Kumar',
                    email: 'aarav@school.com',
                    enrollmentId: 'ENR001',
                    mathScore: 85,
                    scienceScore: 78,
                    quizzesCompleted: 12,
                    lastActive: new Date(Date.now() - 3600000)
                },
                {
                    id: 'student_2',
                    name: 'Priya Singh',
                    email: 'priya@school.com',
                    enrollmentId: 'ENR002',
                    mathScore: 92,
                    scienceScore: 88,
                    quizzesCompleted: 15,
                    lastActive: new Date(Date.now() - 1800000)
                },
                {
                    id: 'student_3',
                    name: 'Rajesh Patel',
                    email: 'rajesh@school.com',
                    enrollmentId: 'ENR003',
                    mathScore: 65,
                    scienceScore: 58,
                    quizzesCompleted: 7,
                    lastActive: new Date(Date.now() - 7200000)
                }
            ];
            
            return { success: true, students };
        } catch (error) {
            console.error('Error fetching students:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save quiz result to Firestore
     */
    async saveQuizResult(studentId, lessonId, score, answers) {
        try {
            const result = {
                studentId,
                lessonId,
                score,
                answers,
                completedAt: new Date(),
                synced: this.isOnline
            };

            // In production: save to Firestore
            console.log('Saving quiz result:', result);
            
            return { success: true, result };
        } catch (error) {
            console.error('Error saving quiz result:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync offline data when back online
     */
    async syncOfflineData() {
        try {
            if (!this.isOnline) {
                return { success: false, error: 'Not online' };
            }

            // In production: sync all pending data with Firestore
            console.log('Syncing offline data...');
            
            return { success: true };
        } catch (error) {
            console.error('Error syncing data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get student progress
     */
    async getStudentProgress(studentId) {
        try {
            // Mock data - replace with Firestore query
            const progress = {
                studentId,
                completedLessons: 8,
                totalScore: 82,
                badgesEarned: 3,
                subjects: {
                    math: { completed: 5, score: 85 },
                    science: { completed: 3, score: 78 }
                }
            };

            return { success: true, progress };
        } catch (error) {
            console.error('Error fetching progress:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get online status
     */
    getOnlineStatus() {
        return this.isOnline;
    }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
