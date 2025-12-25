/**
 * Router Module
 * Handles client-side routing and page navigation
 */

export class Router {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.setupNavigation();
    }

    /**
     * Get current page from URL or document location
     */
    getCurrentPage() {
        const pathname = window.location.pathname;
        return pathname.split('/').pop() || 'index.html';
    }

    /**
     * Navigate to a page
     */
    navigate(path) {
        // Handle absolute and relative paths
        let fullPath = path;
        
        if (!path.startsWith('/')) {
            // Get current directory
            const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
            fullPath = currentDir + '/' + path;
        }

        window.location.href = fullPath;
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigation() {
        // Handle back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.history.back();
            });
        }

        // Handle subject card clicks
        const subjectCards = document.querySelectorAll('.subject-card');
        subjectCards.forEach(card => {
            card.addEventListener('click', () => {
                const subjectId = card.dataset.subjectId;
                const lessonId = card.dataset.lessonId;
                this.navigateToLesson(subjectId, lessonId);
            });
        });

        // Handle lesson item clicks
        const lessonItems = document.querySelectorAll('.lesson-item');
        lessonItems.forEach(item => {
            item.addEventListener('click', () => {
                const lessonId = item.dataset.lessonId;
                this.navigateToLesson(null, lessonId);
            });
        });

        // Handle quiz initiation
        const startQuizBtn = document.getElementById('startQuizBtn');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => {
                const lessonId = this.getLessonIdFromURL();
                if (lessonId) {
                    this.navigateToQuiz(lessonId);
                }
            });
        }

        // Handle next/previous lesson buttons
        const nextLessonBtn = document.getElementById('nextLessonBtn');
        const prevLessonBtn = document.getElementById('prevLessonBtn');

        if (nextLessonBtn) {
            nextLessonBtn.addEventListener('click', () => {
                const nextId = nextLessonBtn.dataset.nextLessonId;
                if (nextId) {
                    this.navigateToLesson(null, nextId);
                }
            });
        }

        if (prevLessonBtn) {
            prevLessonBtn.addEventListener('click', () => {
                const prevId = prevLessonBtn.dataset.prevLessonId;
                if (prevId) {
                    this.navigateToLesson(null, prevId);
                }
            });
        }
    }

    /**
     * Navigate to lesson page
     */
    navigateToLesson(subjectId, lessonId) {
        const params = new URLSearchParams();
        if (subjectId) params.append('subject', subjectId);
        if (lessonId) params.append('lesson', lessonId);
        
        const queryString = params.toString();
        const url = './lesson.html' + (queryString ? '?' + queryString : '');
        this.navigate(url);
    }

    /**
     * Navigate to quiz page
     */
    navigateToQuiz(lessonId) {
        const params = new URLSearchParams();
        params.append('lesson', lessonId);
        this.navigate(`./quiz.html?${params.toString()}`);
    }

    /**
     * Navigate to teacher dashboard
     */
    navigateToTeacher() {
        this.navigate('/pages/teacher.html');
    }

    /**
     * Navigate to student dashboard
     */
    navigateToStudent() {
        this.navigate('/pages/student.html');
    }

    /**
     * Get lesson ID from URL parameters
     */
    getLessonIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('lesson');
    }

    /**
     * Get subject ID from URL parameters
     */
    getSubjectIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('subject');
    }

    /**
     * Check if current page is student dashboard
     */
    isStudentDashboard() {
        return this.currentPage === 'student.html';
    }

    /**
     * Check if current page is teacher dashboard
     */
    isTeacherDashboard() {
        return this.currentPage === 'teacher.html';
    }

    /**
     * Check if current page is lesson
     */
    isLessonPage() {
        return this.currentPage === 'lesson.html';
    }

    /**
     * Check if current page is quiz
     */
    isQuizPage() {
        return this.currentPage === 'quiz.html';
    }

    /**
     * Check if current page is offline
     */
    isOfflinePage() {
        return this.currentPage === 'offline.html';
    }

    /**
     * Redirect to offline page if needed
     */
    redirectToOfflineIfNeeded() {
        if (!navigator.onLine && !this.isOfflinePage()) {
            this.navigate('./offline.html');
        }
    }
}

// Export singleton instance
export const router = new Router();

// Auto-initialize router listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    router.setupNavigation();
});
