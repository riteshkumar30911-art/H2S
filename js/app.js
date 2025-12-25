/**
 * Main Application Entry Point
 * Initializes the entire offline-first student education app
 */

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize IndexedDB
    await db.init();
    console.log('✓ Database initialized');

    // 2. Initialize i18n (Internationalization)
    await i18n.init();
    console.log('✓ Internationalization initialized');

    // 3. Register Service Worker for offline support
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('js/sw.js');
        console.log('✓ Service Worker registered');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }

    // 4. Initialize authentication
    auth.init();
    console.log('✓ Authentication initialized');

    // 5. Check network status and set up sync
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    console.log('✓ Sync system initialized');

    // 6. Set up router and navigate to appropriate page
    router.init();
    console.log('✓ Router initialized');

    // 7. Initialize UI event handlers
    ui.init();
    console.log('✓ UI initialized');

    console.log('✅ Application fully initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    showError('Failed to initialize application. Please refresh the page.');
  }
});

/**
 * Update online status and handle sync accordingly
 */
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  const statusElement = document.getElementById('online-status');

  if (isOnline) {
    console.log('🟢 Online');
    if (statusElement) {
      statusElement.textContent = '🟢 Online';
      statusElement.style.display = 'none';
    }
    // Sync any pending data
    sync.syncAll();
  } else {
    console.log('🔴 Offline');
    if (statusElement) {
      statusElement.textContent = '🔴 Offline Mode';
      statusElement.style.display = 'block';
    }
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  document.body.insertBefore(errorElement, document.body.firstChild);
  
  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showError('An unexpected error occurred. Please try again.');
});

/**
 * Unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  showError('An unexpected error occurred. Please try again.');
});

// Export for debugging
window.appDebug = {
  db,
  auth,
  router,
  sync,
  ui,
  i18n,
  getAppState: () => ({
    isOnline: navigator.onLine,
    currentUser: auth.getCurrentUser(),
    currentPage: router.getCurrentPage(),
  }),
};
