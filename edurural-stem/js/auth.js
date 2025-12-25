/**
 * Authentication Module
 * Handles user login, signup, and role-based access control
 */

import { firebaseService } from './firebase.js';
import { router } from './router.js';

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuthListeners();
    }

    /**
     * Initialize authentication listeners
     */
    initializeAuthListeners() {
        // Check if user is already logged in
        const stored = firebaseService.getCurrentUser();
        if (stored) {
            this.currentUser = stored;
        }

        // Listen for logout requests
        window.addEventListener('logoutRequest', () => {
            this.logout();
        });
    }

    /**
     * Student login
     */
    async studentLogin(email, password) {
        try {
            const result = await firebaseService.loginUser(email, password, 'student');
            
            if (result.success) {
                this.currentUser = result.user;
                router.navigate('/pages/student.html');
                return { success: true };
            }
            
            return result;
        } catch (error) {
            console.error('Student login error:', error);
            return { success: false, error: 'Login failed' };
        }
    }

    /**
     * Student signup
     */
    async studentSignup(name, email, password, confirmPassword) {
        try {
            // Validation
            if (!email || !password || !name) {
                return { success: false, error: 'All fields are required' };
            }

            if (password !== confirmPassword) {
                return { success: false, error: 'Passwords do not match' };
            }

            if (password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }

            if (!this.isValidEmail(email)) {
                return { success: false, error: 'Invalid email format' };
            }

            const result = await firebaseService.signupUser(email, password, name, 'student');
            
            if (result.success) {
                this.currentUser = result.user;
                router.navigate('/pages/student.html');
                return { success: true };
            }
            
            return result;
        } catch (error) {
            console.error('Student signup error:', error);
            return { success: false, error: 'Signup failed' };
        }
    }

    /**
     * Teacher login
     */
    async teacherLogin(email, password) {
        try {
            const result = await firebaseService.loginUser(email, password, 'teacher');
            
            if (result.success) {
                this.currentUser = result.user;
                router.navigate('/pages/teacher.html');
                return { success: true };
            }
            
            return result;
        } catch (error) {
            console.error('Teacher login error:', error);
            return { success: false, error: 'Login failed' };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            const result = await firebaseService.logoutUser();
            
            if (result.success) {
                this.currentUser = null;
                router.navigate('/index.html');
                return { success: true };
            }
            
            return result;
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Logout failed' };
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Check if user is teacher
     */
    isTeacher() {
        return this.currentUser?.role === 'teacher';
    }

    /**
     * Check if user is student
     */
    isStudent() {
        return this.currentUser?.role === 'student';
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Check if page requires authentication
     */
    requireAuth(page) {
        if (!this.isAuthenticated()) {
            router.navigate('/index.html');
            return false;
        }
        return true;
    }

    /**
     * Check if page requires teacher role
     */
    requireTeacher(page) {
        if (!this.isAuthenticated() || !this.isTeacher()) {
            router.navigate('/index.html');
            return false;
        }
        return true;
    }

    /**
     * Check if page requires student role
     */
    requireStudent(page) {
        if (!this.isAuthenticated() || !this.isStudent()) {
            router.navigate('/index.html');
            return false;
        }
        return true;
    }
}

// Export singleton instance
export const authManager = new AuthManager();

// Setup event listeners for login forms
document.addEventListener('DOMContentLoaded', () => {
    const studentLoginForm = document.getElementById('studentLoginForm');
    const studentSignupForm = document.getElementById('studentSignupForm');
    const teacherLoginForm = document.getElementById('teacherLoginForm');

    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('studentEmail').value;
            const password = document.getElementById('studentPassword').value;
            
            const result = await authManager.studentLogin(email, password);
            if (!result.success) {
                alert(result.error || 'Login failed');
            }
        });
    }

    if (studentSignupForm) {
        studentSignupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('studentName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            const result = await authManager.studentSignup(name, email, password, confirmPassword);
            if (!result.success) {
                alert(result.error || 'Signup failed');
            }
        });
    }

    if (teacherLoginForm) {
        teacherLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('teacherEmail').value;
            const password = document.getElementById('teacherPassword').value;
            
            const result = await authManager.teacherLogin(email, password);
            if (!result.success) {
                alert(result.error || 'Login failed');
            }
        });
    }

    // Logout button listeners
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            authManager.logout();
        });
    });

    // Modal toggles on landing page
    const studentLoginBtn = document.getElementById('studentLoginBtn');
    const teacherLoginBtn = document.getElementById('teacherLoginBtn');
    const studentSignupToggle = document.getElementById('studentSignupToggle');

    if (studentLoginBtn) {
        studentLoginBtn.addEventListener('click', () => {
            document.getElementById('studentLoginModal')?.classList.remove('hidden');
        });
    }

    if (teacherLoginBtn) {
        teacherLoginBtn.addEventListener('click', () => {
            document.getElementById('teacherLoginModal')?.classList.remove('hidden');
        });
    }

    if (studentSignupToggle) {
        studentSignupToggle.addEventListener('click', () => {
            document.getElementById('studentLoginModal')?.classList.add('hidden');
            document.getElementById('studentSignupModal')?.classList.remove('hidden');
        });
    }

    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal')?.classList.add('hidden');
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
});

// Global helper functions for pages
function getCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse user data:', e);
            return null;
        }
    }
    return null;
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionToken');
}

async function getLesson(lessonId) {
    try {
        const response = await fetch('../data/lessons.json');
        const data = await response.json();
        return data.lessons.find(l => l.id === lessonId);
    } catch (error) {
        console.error('Error loading lesson:', error);
        return null;
    }
}

async function getAllLessons() {
    try {
        const response = await fetch('../data/lessons.json');
        const data = await response.json();
        return data.lessons || [];
    } catch (error) {
        console.error('Error loading lessons:', error);
        return [];
    }
}

async function getQuiz(quizId) {
    try {
        const response = await fetch('../data/quiz.json');
        const data = await response.json();
        return data.quizzes?.find(q => q.id === quizId) || data.quizzes?.find(q => q.lessonId === quizId);
    } catch (error) {
        console.error('Error loading quiz:', error);
        return null;
    }
}

async function getAllProgress(userId) {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['progress'], 'readonly');
            const objectStore = transaction.objectStore('progress');
            const index = objectStore.index('userId');
            const request = index.getAll(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error loading progress:', error);
        return [];
    }
}

async function updateProgress(userId, itemId, progressData) {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['progress'], 'readwrite');
            const objectStore = transaction.objectStore('progress');
            const key = `${userId}_${itemId}`;
            const request = objectStore.put({
                id: key,
                userId,
                lessonId: itemId,
                quizId: itemId,
                ...progressData
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        return false;
    }
}

async function getAllUsers() {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readonly');
            const objectStore = transaction.objectStore('users');
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

// IndexedDB helper
const DB_NAME = 'educenter_db';
const DB_VERSION = 1;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('progress')) {
                const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
                progressStore.createIndex('userId', 'userId', { unique: false });
            }
            if (!db.objectStoreNames.contains('lessons')) {
                db.createObjectStore('lessons', { keyPath: 'id' });
            }
        };
    });
}
