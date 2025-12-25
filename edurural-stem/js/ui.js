/**
 * UI Module
 * Handles dynamic UI rendering, state management, and user interactions
 */

import { authManager } from './auth.js';
import { firebaseService } from './firebase.js';
import { dbService } from './indexedDB.js';
import { router } from './router.js';
import { i18n } from './i18n.js';

export class UIManager {
    constructor() {
        this.currentUser = null;
        this.currentLessonId = null;
        this.currentQuizId = null;
        this.quizStartTime = null;
        this.initializeUI();
    }

    /**
     * Initialize UI components
     */
    async initializeUI() {
        // Wait for DB to initialize
        await dbService.init();

        // Get current user
        this.currentUser = authManager.getCurrentUser();

        // Update offline status
        this.updateOfflineStatus();
        window.addEventListener('online', () => this.updateOfflineStatus());
        window.addEventListener('offline', () => this.updateOfflineStatus());

        // Initialize page-specific UI
        this.initializePageUI();
    }

    /**
     * Initialize page-specific UI based on current page
     */
    async initializePageUI() {
        if (router.isStudentDashboard()) {
            await this.initStudentDashboard();
        } else if (router.isTeacherDashboard()) {
            await this.initTeacherDashboard();
        } else if (router.isLessonPage()) {
            await this.initLessonPage();
        } else if (router.isQuizPage()) {
            await this.initQuizPage();
        }
    }

    /**
     * Initialize student dashboard
     */
    async initStudentDashboard() {
        // Check authentication
        if (!authManager.requireStudent('student.html')) return;

        const studentName = document.getElementById('studentName');
        if (studentName && this.currentUser) {
            studentName.textContent = this.currentUser.displayName || 'Student';
        }

        // Load and display subjects
        await this.loadSubjects();

        // Load student progress
        await this.loadStudentProgress();

        // Load recent activity
        await this.loadRecentActivity();

        // Load badges
        await this.loadBadges();
    }

    /**
     * Load subjects for student
     */
    async loadSubjects() {
        try {
            const subjectsData = [
                {
                    id: 'math',
                    name: 'Mathematics',
                    icon: '∑',
                    progress: 65,
                    lessonsCount: 12,
                    lessons: [
                        { id: 'math_1', name: 'Introduction to Algebra', completed: true },
                        { id: 'math_2', name: 'Quadratic Equations', completed: true },
                        { id: 'math_3', name: 'Trigonometry Basics', completed: false }
                    ]
                },
                {
                    id: 'science',
                    name: 'Science',
                    icon: '⚗️',
                    progress: 58,
                    lessonsCount: 10,
                    lessons: [
                        { id: 'sci_1', name: 'Physics Fundamentals', completed: true },
                        { id: 'sci_2', name: 'Chemical Reactions', completed: false },
                        { id: 'sci_3', name: 'Biology Basics', completed: false }
                    ]
                }
            ];

            const subjectsGrid = document.getElementById('subjectsGrid');
            if (!subjectsGrid) return;

            subjectsGrid.innerHTML = subjectsData.map(subject => `
                <div class="subject-card ${subject.id}" data-subject-id="${subject.id}" data-lesson-id="${subject.lessons[0].id}">
                    <div class="subject-header">
                        <div class="subject-icon">${subject.icon}</div>
                        <div>
                            <h3 class="subject-title">${subject.name}</h3>
                            <p class="lesson-count">${subject.lessonsCount} Lessons</p>
                        </div>
                    </div>
                    <div class="subject-progress">
                        <div class="progress-label">
                            <span>Progress</span>
                            <span>${subject.progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${subject.progress}%"></div>
                        </div>
                    </div>
                    <ul class="lesson-list">
                        ${subject.lessons.map(lesson => `
                            <li class="lesson-item" data-lesson-id="${lesson.id}">
                                <span class="lesson-name">${lesson.name}</span>
                                <span class="lesson-status">${lesson.completed ? '✓' : '→'}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `).join('');

            // Add click handlers
            subjectsGrid.querySelectorAll('.subject-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.lesson-item')) return;
                    const lessonId = card.dataset.lessonId;
                    router.navigateToLesson(card.dataset.subjectId, lessonId);
                });
            });

            subjectsGrid.querySelectorAll('.lesson-item').forEach(item => {
                item.addEventListener('click', () => {
                    router.navigateToLesson(null, item.dataset.lessonId);
                });
            });
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }

    /**
     * Load student progress
     */
    async loadStudentProgress() {
        try {
            if (!this.currentUser) return;

            const progress = await dbService.getStudentProgress(this.currentUser.uid);
            
            const completedLessons = document.getElementById('completedLessons');
            const totalScore = document.getElementById('totalScore');
            const badgesCount = document.getElementById('badgesCount');

            if (progress) {
                if (completedLessons) completedLessons.textContent = progress.completedLessons || 0;
                if (totalScore) totalScore.textContent = Math.round(progress.totalScore || 0) + '%';
                if (badgesCount) badgesCount.textContent = progress.badgesEarned || 0;
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    /**
     * Load recent activity
     */
    async loadRecentActivity() {
        try {
            const recentActivityList = document.getElementById('recentActivityList');
            if (!recentActivityList) return;

            // Mock recent activity
            const activities = [
                { title: 'Completed Quiz: Algebra Basics', time: '2 hours ago', type: 'quiz' },
                { title: 'Started Lesson: Trigonometry', time: '5 hours ago', type: 'lesson' },
                { title: 'Earned Badge: Math Master', time: '1 day ago', type: 'badge' }
            ];

            recentActivityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    /**
     * Load badges
     */
    async loadBadges() {
        try {
            const badgesList = document.getElementById('badgesList');
            if (!badgesList) return;

            const badges = [
                { icon: '🏆', name: 'Math Master', description: 'Score 90+ on math quiz', earned: true },
                { icon: '⚗️', name: 'Science Scholar', description: 'Complete 5 science lessons', earned: false },
                { icon: '🚀', name: 'Rocket Scientist', description: 'Unlock all STEM badges', earned: false }
            ];

            badgesList.innerHTML = badges.map(badge => `
                <div class="badge ${!badge.earned ? 'locked' : ''}">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-description">${badge.description}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading badges:', error);
        }
    }

    /**
     * Initialize teacher dashboard
     */
    async initTeacherDashboard() {
        // Check authentication
        if (!authManager.requireTeacher('teacher.html')) return;

        const teacherName = document.getElementById('teacherName');
        if (teacherName && this.currentUser) {
            teacherName.textContent = this.currentUser.displayName || 'Teacher';
        }

        // Load students
        await this.loadStudents();

        // Load statistics
        await this.loadTeacherStats();

        // Setup search and filter
        this.setupStudentFilters();
    }

    /**
     * Load students for teacher
     */
    async loadStudents() {
        try {
            const result = await firebaseService.getStudents();
            if (!result.success) {
                console.error('Error fetching students:', result.error);
                return;
            }

            const students = result.students;
            this.displayStudentTable(students);
            this.displayWeakStudents(students);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    /**
     * Display student table
     */
    displayStudentTable(students) {
        const tbody = document.getElementById('studentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = students.map(student => {
            const avgScore = Math.round((student.mathScore + student.scienceScore) / 2);
            const statusClass = avgScore >= 80 ? 'excellent' : avgScore >= 60 ? 'good' : 'needsHelp';
            const statusText = avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Needs Help';

            return `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.enrollmentId}</td>
                    <td>${student.email}</td>
                    <td>${student.mathScore}%</td>
                    <td>${student.scienceScore}%</td>
                    <td>${avgScore}%</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-secondary table-action-btn view-details" data-student-id="${student.id}">
                            View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add click handlers for view buttons
        tbody.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const studentId = btn.dataset.studentId;
                this.showStudentDetail(students.find(s => s.id === studentId));
            });
        });
    }

    /**
     * Display weak students
     */
    displayWeakStudents(students) {
        const weakStudentsList = document.getElementById('weakStudentsList');
        if (!weakStudentsList) return;

        const weakStudents = students.filter(s => {
            const avg = (s.mathScore + s.scienceScore) / 2;
            return avg < 60;
        });

        if (weakStudents.length === 0) {
            weakStudentsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">All students are performing well!</p>';
            return;
        }

        weakStudentsList.innerHTML = weakStudents.map(student => `
            <div class="weak-student-card">
                <div class="weak-student-name">${student.name}</div>
                <div class="weak-student-issue">
                    Avg Score: ${Math.round((student.mathScore + student.scienceScore) / 2)}%
                </div>
                <div class="weak-student-action">
                    <button class="btn btn-small btn-secondary send-msg" data-student-id="${student.id}">
                        Send Message
                    </button>
                </div>
            </div>
        `).join('');

        // Add message handlers
        weakStudentsList.querySelectorAll('.send-msg').forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Message feature coming soon!');
            });
        });
    }

    /**
     * Show student detail modal
     */
    showStudentDetail(student) {
        const modal = document.getElementById('studentDetailModal');
        if (!modal) return;

        document.getElementById('detailStudentName').textContent = student.name;
        document.getElementById('detailEmail').textContent = student.email;
        document.getElementById('detailEnrollmentId').textContent = student.enrollmentId;
        document.getElementById('detailMathScore').textContent = student.mathScore + '%';
        document.getElementById('detailScienceScore').textContent = student.scienceScore + '%';
        document.getElementById('detailMathProgress').style.width = student.mathScore + '%';
        document.getElementById('detailScienceProgress').style.width = student.scienceScore + '%';

        modal.classList.remove('hidden');

        document.getElementById('closeDetailBtn').onclick = () => {
            modal.classList.add('hidden');
        };
    }

    /**
     * Load teacher statistics
     */
    async loadTeacherStats() {
        try {
            const result = await firebaseService.getStudents();
            if (!result.success) return;

            const students = result.students;
            const avgScore = Math.round(
                students.reduce((sum, s) => sum + (s.mathScore + s.scienceScore) / 2, 0) / students.length
            );
            const needsAttention = students.filter(s => {
                const avg = (s.mathScore + s.scienceScore) / 2;
                return avg < 60;
            }).length;

            document.getElementById('totalStudents').textContent = students.length;
            document.getElementById('completedQuizzes').textContent = students.reduce((sum, s) => sum + s.quizzesCompleted, 0);
            document.getElementById('avgScore').textContent = avgScore + '%';
            document.getElementById('needsAttention').textContent = needsAttention;
        } catch (error) {
            console.error('Error loading teacher stats:', error);
        }
    }

    /**
     * Setup student search and filters
     */
    setupStudentFilters() {
        const searchInput = document.getElementById('studentSearch');
        const subjectFilter = document.getElementById('subjectFilter');
        const statusFilter = document.getElementById('statusFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterTable();
            });
        }

        if (subjectFilter) {
            subjectFilter.addEventListener('change', () => {
                this.filterTable();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterTable();
            });
        }
    }

    /**
     * Filter student table
     */
    filterTable() {
        const searchValue = document.getElementById('studentSearch')?.value.toLowerCase() || '';
        const statusValue = document.getElementById('statusFilter')?.value || '';

        const rows = document.querySelectorAll('.students-table tbody tr');
        rows.forEach(row => {
            const name = row.cells[0]?.textContent.toLowerCase() || '';
            const badge = row.cells[6]?.textContent.toLowerCase() || '';

            let show = true;

            if (searchValue && !name.includes(searchValue)) {
                show = false;
            }

            if (statusValue && !badge.includes(statusValue.toLowerCase())) {
                show = false;
            }

            row.style.display = show ? '' : 'none';
        });
    }

    /**
     * Initialize lesson page
     */
    async initLessonPage() {
        if (!authManager.requireStudent('lesson.html')) return;

        const lessonId = router.getLessonIdFromURL();
        if (!lessonId) {
            router.navigate('./student.html');
            return;
        }

        this.currentLessonId = lessonId;
        await this.loadLesson(lessonId);
    }

    /**
     * Load lesson content
     */
    async loadLesson(lessonId) {
        try {
            const lesson = await dbService.getLesson(lessonId) || await this.getMockLesson(lessonId);
            
            if (!lesson) {
                console.error('Lesson not found:', lessonId);
                return;
            }

            // Update page title and content
            document.getElementById('lessonTitle').textContent = lesson.title;
            document.getElementById('lessonName').textContent = lesson.title;
            document.getElementById('subjectName').textContent = lesson.subject;
            document.getElementById('lessonDuration').textContent = lesson.duration;
            document.getElementById('lessonDifficulty').textContent = lesson.difficulty;

            // Load lesson content
            const contentDiv = document.getElementById('lessonContent');
            contentDiv.innerHTML = `
                <h2>${lesson.title}</h2>
                ${lesson.content || '<p>Lesson content loading...</p>'}
                ${lesson.image ? `<img src="${lesson.image}" alt="${lesson.title}">` : ''}
            `;

            // Setup quiz button
            const startQuizBtn = document.getElementById('startQuizBtn');
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', () => {
                    router.navigateToQuiz(lessonId);
                });
            }
        } catch (error) {
            console.error('Error loading lesson:', error);
        }
    }

    /**
     * Get mock lesson data (for demo)
     */
    getMockLesson(lessonId) {
        const lessons = {
            math_1: {
                title: 'Introduction to Algebra',
                subject: 'Mathematics',
                duration: '15 min read',
                difficulty: 'Beginner',
                content: `
                    <p>Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. 
                    It's a unifying thread of almost all of mathematics and is essential in everyday problem solving.</p>
                    <h3>Key Concepts:</h3>
                    <ul>
                        <li><strong>Variables:</strong> Symbols that represent unknown values</li>
                        <li><strong>Expressions:</strong> Combinations of variables, numbers, and operations</li>
                        <li><strong>Equations:</strong> Statements showing two expressions are equal</li>
                    </ul>
                    <h3>Example Problem:</h3>
                    <p>Solve: 2x + 5 = 13</p>
                    <p>Solution: x = 4</p>
                `
            },
            sci_1: {
                title: 'Physics Fundamentals',
                subject: 'Science',
                duration: '12 min read',
                difficulty: 'Beginner',
                content: `
                    <p>Physics is the natural science that studies matter, motion, and forces. 
                    It helps us understand how the universe works.</p>
                    <h3>Major Areas:</h3>
                    <ul>
                        <li><strong>Mechanics:</strong> Study of motion and forces</li>
                        <li><strong>Thermodynamics:</strong> Study of heat and energy</li>
                        <li><strong>Waves & Optics:</strong> Study of light and sound</li>
                    </ul>
                `
            }
        };

        return Promise.resolve(lessons[lessonId]);
    }

    /**
     * Initialize quiz page
     */
    async initQuizPage() {
        if (!authManager.requireStudent('quiz.html')) return;

        const lessonId = router.getLessonIdFromURL();
        if (!lessonId) {
            router.navigate('./student.html');
            return;
        }

        this.currentLessonId = lessonId;
        this.quizStartTime = new Date();
        
        await this.loadQuiz(lessonId);
        this.startQuizTimer();
    }

    /**
     * Load quiz questions
     */
    async loadQuiz(lessonId) {
        try {
            const quiz = await dbService.getQuizByLessonId(lessonId) || this.getMockQuiz(lessonId);
            
            if (!quiz) {
                console.error('Quiz not found');
                return;
            }

            document.getElementById('lessonName').textContent = quiz.title || 'Quiz';
            document.getElementById('totalQuestions').textContent = quiz.questions.length;

            const container = document.getElementById('questionsContainer');
            container.innerHTML = quiz.questions.map((q, idx) => `
                <div class="question" data-question-index="${idx}">
                    <div class="question-number">Question ${idx + 1}</div>
                    <div class="question-text">${q.text}</div>
                    ${q.image ? `<img src="${q.image}" class="question-image">` : ''}
                    <ul class="options">
                        ${q.options.map((option, optIdx) => `
                            <li class="option">
                                <input type="radio" name="q${idx}" id="q${idx}_o${optIdx}" value="${optIdx}">
                                <label for="q${idx}_o${optIdx}">${option}</label>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `).join('');

            // Setup quiz navigation
            this.setupQuizNavigation(quiz.questions.length);
        } catch (error) {
            console.error('Error loading quiz:', error);
        }
    }

    /**
     * Get mock quiz
     */
    getMockQuiz(lessonId) {
        const quizzes = {
            math_1: {
                title: 'Algebra Basics Quiz',
                questions: [
                    {
                        text: 'What is the value of x if 2x + 5 = 13?',
                        options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
                        correct: 1
                    },
                    {
                        text: 'Simplify: 3(2x + 4)',
                        options: ['6x + 12', '5x + 7', '6x + 4', '3x + 12'],
                        correct: 0
                    },
                    {
                        text: 'Solve: x - 7 = 3',
                        options: ['x = 4', 'x = 10', 'x = -4', 'x = -10'],
                        correct: 1
                    },
                    {
                        text: 'What is 5² + 3?',
                        options: ['28', '25', 'x = 4', '13'],
                        correct: 0
                    },
                    {
                        text: 'If a = 2 and b = 3, find ab + 5',
                        options: ['10', '11', '15', '20'],
                        correct: 1
                    }
                ]
            }
        };

        return quizzes[lessonId];
    }

    /**
     * Setup quiz navigation
     */
    setupQuizNavigation(totalQuestions) {
        let currentQuestion = 0;
        this.showQuestion(currentQuestion);

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const form = document.getElementById('quizForm');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentQuestion > 0) {
                    currentQuestion--;
                    this.showQuestion(currentQuestion);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentQuestion < totalQuestions - 1) {
                    currentQuestion++;
                    this.showQuestion(currentQuestion);
                } else {
                    nextBtn.style.display = 'none';
                    submitBtn.style.display = 'inline-block';
                }
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitQuiz();
            });
        }

        if (form) {
            form.addEventListener('change', () => {
                this.updateProgress(currentQuestion, totalQuestions);
            });
        }
    }

    /**
     * Show specific question
     */
    showQuestion(index) {
        const questions = document.querySelectorAll('.question');
        questions.forEach((q, idx) => {
            q.style.display = idx === index ? 'block' : 'none';
        });

        document.getElementById('currentQuestion').textContent = index + 1;

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
        if (nextBtn && submitBtn) {
            if (index === document.querySelectorAll('.question').length - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-block';
            } else {
                nextBtn.style.display = 'inline-block';
                submitBtn.style.display = 'none';
            }
        }
    }

    /**
     * Start quiz timer
     */
    startQuizTimer() {
        const timerEl = document.getElementById('timerValue');
        if (!timerEl) return;

        let secondsLeft = 600; // 10 minutes

        const interval = setInterval(() => {
            secondsLeft--;
            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (secondsLeft <= 0) {
                clearInterval(interval);
                this.submitQuiz();
            }
        }, 1000);
    }

    /**
     * Update quiz progress
     */
    updateProgress(current, total) {
        const percentage = Math.round(((current + 1) / total) * 100);
        const fill = document.getElementById('progressFill');
        if (fill) {
            fill.style.width = percentage + '%';
        }
    }

    /**
     * Submit quiz and show results
     */
    async submitQuiz() {
        const questions = document.querySelectorAll('.question');
        let correctCount = 0;
        const answers = [];

        // Mock quiz data for scoring
        const mockCorrectAnswers = [1, 0, 1, 0, 1]; // For math_1 quiz

        questions.forEach((q, idx) => {
            const selected = q.querySelector('input[type="radio"]:checked');
            const selectedIndex = selected ? parseInt(selected.value) : -1;
            
            answers.push(selectedIndex);

            if (selectedIndex === mockCorrectAnswers[idx]) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / questions.length) * 100);
        const timeTaken = Math.round((new Date() - this.quizStartTime) / 60000);

        // Save quiz result
        if (this.currentUser) {
            await dbService.saveQuizResult({
                studentId: this.currentUser.uid,
                lessonId: this.currentLessonId,
                score,
                answers,
                completedAt: new Date(),
                timeTaken
            });

            // Also sync to Firebase if online
            if (navigator.onLine) {
                await firebaseService.saveQuizResult(this.currentUser.uid, this.currentLessonId, score, answers);
            }
        }

        // Show results modal
        this.showQuizResults(score, correctCount, questions.length, timeTaken);
    }

    /**
     * Show quiz results
     */
    showQuizResults(score, correctCount, totalQuestions, timeTaken) {
        const modal = document.getElementById('resultsModal');
        if (!modal) return;

        document.getElementById('scorePercentage').textContent = score + '%';
        document.getElementById('correctCount').textContent = correctCount;
        document.getElementById('resultTotalQuestions').textContent = totalQuestions;
        document.getElementById('timeTaken').textContent = timeTaken + ' min';

        // Set feedback based on score
        let feedback = '';
        if (score >= 80) {
            feedback = 'Excellent! Keep up the great work!';
        } else if (score >= 60) {
            feedback = 'Good job! Review the material and try again.';
        } else {
            feedback = 'Keep practicing! You\'ll improve.';
        }
        document.getElementById('scoreFeedback').textContent = feedback;

        // Show badge if earned
        if (score >= 80) {
            document.getElementById('badgeEarned').classList.remove('hidden');
        }

        modal.classList.remove('hidden');

        document.getElementById('closeResultsBtn').addEventListener('click', () => {
            router.navigate('./student.html');
        });
    }

    /**
     * Update offline status indicator
     */
    updateOfflineStatus() {
        const banner = document.getElementById('offlineBanner');
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        if (!navigator.onLine) {
            if (banner) banner.classList.remove('hidden');
            if (statusDot) statusDot.style.backgroundColor = '#FF9800';
            if (statusText) statusText.textContent = i18n.t('offline');
        } else {
            if (banner) banner.classList.add('hidden');
            if (statusDot) statusDot.style.backgroundColor = '#4CAF50';
            if (statusText) statusText.textContent = i18n.t('online');
        }
    }
}

// Export singleton instance
export const uiManager = new UIManager();
