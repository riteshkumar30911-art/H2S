/**
 * Main Application Entry Point & Initialization
 * Initializes all modules and sets up the offline-first application
 */

// Store initialization status
window.appState = {
  isInitialized: false,
  isOnline: navigator.onLine,
  currentUser: null,
  isSyncing: false,
};

/**
 * Initialize the entire application
 */
async function initializeApp() {
  console.log('🚀 Starting application initialization...');
  
  try {
    // 1. Initialize IndexedDB for offline storage
    console.log('Initializing database...');
    await initDB();
    console.log('✓ Database initialized');

    // 2. Check and handle online/offline status
    console.log('Setting up network monitoring...');
    updateOnlineStatus();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    console.log('✓ Network monitoring enabled');

    // 3. Set up authentication state listeners
    console.log('Initializing authentication...');
    setupAuthListeners();
    console.log('✓ Authentication initialized');

    // 4. Initialize UI components and event handlers
    console.log('Initializing UI...');
    initializeUI();
    console.log('✓ UI initialized');

    // 5. Set up automatic synchronization
    console.log('Setting up synchronization...');
    setupSync();
    console.log('✓ Sync initialized');

    window.appState.isInitialized = true;
    console.log('✅ Application fully initialized');
    
    // Trigger initial navigation
    checkAuthAndNavigate();
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    showError('Failed to initialize application. Please refresh the page.');
  }
}

/**
 * Check current user and navigate to appropriate page
 */
function checkAuthAndNavigate() {
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    // User is logged in - navigate to dashboard
    const dashboard = currentUser.userType === 'teacher' 
      ? 'pages/teacher.html' 
      : 'pages/student.html';
    window.location.href = dashboard;
  } else {
    // User not logged in - stay on landing page
    console.log('No user logged in - showing landing page');
  }
}

/**
 * Handle online status change
 */
function handleOnline() {
  window.appState.isOnline = true;
  console.log('🟢 Online');
  
  const offlineBanner = document.getElementById('offlineBanner');
  if (offlineBanner) {
    offlineBanner.classList.add('hidden');
  }
  
  // Attempt to sync any pending data
  syncPendingData();
}

/**
 * Handle offline status change
 */
function handleOffline() {
  window.appState.isOnline = false;
  console.log('🔴 Offline');
  
  const offlineBanner = document.getElementById('offlineBanner');
  if (offlineBanner) {
    offlineBanner.classList.remove('hidden');
  }
}

/**
 * Update UI based on current online status
 */
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  window.appState.isOnline = isOnline;
  
  const banner = document.getElementById('offlineBanner');
  if (banner) {
    if (!isOnline) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }
}

/**
 * Set up authentication state change listeners
 */
function setupAuthListeners() {
  // Check if user data exists in localStorage
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      window.appState.currentUser = JSON.parse(savedUser);
      console.log('✓ User session restored:', window.appState.currentUser.email);
    } catch (e) {
      console.warn('Failed to restore user session');
      localStorage.removeItem('currentUser');
    }
  }
}

/**
 * Initialize UI event handlers
 */
function setupSync() {
  // Set up periodic sync every 30 seconds when online
  if (window.appState.isOnline) {
    setInterval(() => {
      if (window.appState.isOnline && !window.appState.isSyncing) {
        syncPendingData();
      }
    }, 30000);
  }
}

/**
 * Initialize UI components
 */
function initializeUI() {
  // Set up language toggle if present
  const languageToggle = document.getElementById('languageToggle');
  if (languageToggle) {
    languageToggle.addEventListener('click', cycleLanguage);
  }

  // Set up student login button
  const studentLoginBtn = document.getElementById('studentLoginBtn');
  if (studentLoginBtn) {
    studentLoginBtn.addEventListener('click', () => {
      showAuthModal('student');
    });
  }

  // Set up teacher login button
  const teacherLoginBtn = document.getElementById('teacherLoginBtn');
  if (teacherLoginBtn) {
    teacherLoginBtn.addEventListener('click', () => {
      showAuthModal('teacher');
    });
  }

  // Set up install button for PWA
  setupPWAInstall();
}

/**
 * Cycle through available languages
 */
function cycleLanguage() {
  const languages = ['en', 'es', 'ha', 'sw'];
  const currentLang = localStorage.getItem('language') || 'en';
  const currentIndex = languages.indexOf(currentLang);
  const nextIndex = (currentIndex + 1) % languages.length;
  const nextLang = languages[nextIndex];
  
  setLanguage(nextLang);
  localStorage.setItem('language', nextLang);
  
  // Reload to apply language changes
  location.reload();
}

/**
 * Set UI language
 */
function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = ['ar', 'he'].includes(lang) ? 'rtl' : 'ltr';
  updateTranslations(lang);
}

/**
 * Update all translations on the page
 */
function updateTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(lang, key);
    if (translation) {
      element.textContent = translation;
    }
  });
}

/**
 * Get translation for a key
 */
function getTranslation(lang, key) {
  const translations = {
    en: {
      'app_name': 'EduRural STEM',
      'landing_title': 'Learning Without Limits',
      'landing_subtitle': 'Master STEM concepts anytime, anywhere—even without internet',
      'offline_mode': 'You are in Offline Mode',
      'student_login': 'Student Login',
      'teacher_login': 'Teacher Login',
      'install_pwa': 'Install App',
    },
    es: {
      'app_name': 'EduRural STEM',
      'landing_title': 'Aprendizaje Sin Límites',
      'landing_subtitle': 'Domina conceptos STEM en cualquier momento y lugar, incluso sin internet',
      'offline_mode': 'Estás en Modo Sin Conexión',
      'student_login': 'Iniciar Sesión Estudiante',
      'teacher_login': 'Iniciar Sesión Profesor',
      'install_pwa': 'Instalar Aplicación',
    },
    ha: {
      'app_name': 'EduRural STEM',
      'landing_title': 'Koyon Ba Iyaka',
      'landing_subtitle': 'Kasance da fahimtar STEM a kowane lokaci, ko da sai babu intanet',
      'offline_mode': 'Kun shiga Yanayin Offline',
      'student_login': 'Shiga Ɗalibi',
      'teacher_login': 'Shiga Malami',
      'install_pwa': 'Saka Aikace',
    },
    sw: {
      'app_name': 'EduRural STEM',
      'landing_title': 'Kujifunza Bila Mipango',
      'landing_subtitle': 'Kulingana na mifumo ya STEM wakati wowote, mahali popote—hata bila mtandao',
      'offline_mode': 'Uko katika Hali ya Offline',
      'student_login': 'Ingia Kama Mwanafunzi',
      'teacher_login': 'Ingia Kama Mwalimu',
      'install_pwa': 'Sakinisha Programu',
    },
  };
  
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}

/**
 * Show authentication modal
 */
function showAuthModal(userType) {
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close">&times;</button>
      <h2>${userType === 'teacher' ? 'Teacher Login' : 'Student Login'}</h2>
      <form id="authForm">
        <input type="email" placeholder="Email" required id="email">
        <input type="password" placeholder="Password" required id="password">
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
      <p class="auth-toggle">
        Don't have an account? <a href="#" class="signup-link">Sign up here</a>
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.querySelector('#authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const user = await performLogin(email, password, userType);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.appState.currentUser = user;
        modal.remove();
        checkAuthAndNavigate();
      }
    } catch (error) {
      showError('Login failed: ' + error.message);
    }
  });
}

/**
 * Perform login (placeholder - integrate with actual auth)
 */
async function performLogin(email, password, userType) {
  // This is a placeholder. In production, this would call Firebase Auth
  // For now, we'll create a mock user
  return {
    id: Math.random().toString(36).substr(2, 9),
    email: email,
    userType: userType,
    name: email.split('@')[0],
    lastSync: new Date().toISOString(),
  };
}

/**
 * Sync any pending data to Firebase
 */
async function syncPendingData() {
  if (window.appState.isSyncing) {
    console.log('Sync already in progress');
    return;
  }
  
  window.appState.isSyncing = true;
  console.log('Starting data synchronization...');
  
  try {
    // Get pending operations from IndexedDB
    const pendingOps = await getPendingOperations();
    
    if (pendingOps.length === 0) {
      console.log('No pending operations to sync');
      window.appState.isSyncing = false;
      return;
    }
    
    console.log(`Syncing ${pendingOps.length} pending operations...`);
    
    // In production, you would sync with Firebase here
    // For now, just mark as synced
    for (const op of pendingOps) {
      await markOperationSynced(op.id);
    }
    
    console.log('✓ Data synchronized successfully');
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    window.appState.isSyncing = false;
  }
}

/**
 * Get pending operations from IndexedDB
 */
async function getPendingOperations() {
  // Placeholder - implement based on your IndexedDB schema
  return [];
}

/**
 * Mark operation as synced
 */
async function markOperationSynced(opId) {
  // Placeholder - implement based on your IndexedDB schema
}

/**
 * Get current user
 */
function getCurrentUser() {
  return window.appState.currentUser;
}

/**
 * Show error message
 */
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-banner';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

/**
 * Set up PWA installation prompt
 */
function setupPWAInstall() {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
      installBtn.style.display = 'inline-block';
      installBtn.addEventListener('click', async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Install prompt outcome: ${outcome}`);
        deferredPrompt = null;
      });
    }
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  });
}

/**
 * Initialize app when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for debugging
window.appDebug = {
  appState: window.appState,
  getCurrentUser,
  syncPendingData,
  handleOnline,
  handleOffline,
};
