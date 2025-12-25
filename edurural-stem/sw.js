/**
 * Service Worker for EduRural STEM
 * Handles offline caching and background sync
 */

const CACHE_NAME = 'edurural-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/student.html',
    '/pages/lesson.html',
    '/pages/quiz.html',
    '/pages/teacher.html',
    '/pages/offline.html',
    '/css/styles.css',
    '/js/auth.js',
    '/js/firebase.js',
    '/js/router.js',
    '/js/indexedDB.js',
    '/js/sync.js',
    '/js/i18n.js',
    '/js/ui.js',
    '/manifest.json'
];

// Install event - cache files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching files');
            return cache.addAll(URLS_TO_CACHE).catch((err) => {
                console.log('Some files could not be cached:', err);
                // Don't fail the install if some files can't be cached
                return Promise.resolve();
            });
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Claim clients immediately
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip cross-origin requests
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }

    // For HTML pages: Network first, then cache
    if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache the response for future use
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fall back to cached version
                    return caches.match(request).then((response) => {
                        return response || caches.match('/pages/offline.html');
                    });
                })
        );
        return;
    }

    // For other GET requests: Cache first, then network
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request).then((response) => {
                if (response) {
                    return response;
                }

                return fetch(request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    // Cache successful responses
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });

                    return response;
                }).catch(() => {
                    // Return offline page or a fallback
                    return caches.match('/pages/offline.html');
                });
            })
        );
        return;
    }

    // For POST requests: Try network first, then cache
    if (request.method === 'POST') {
        event.respondWith(
            fetch(request)
                .then((response) => response)
                .catch(() => {
                    // Queue for sync if offline
                    if (request.url.includes('/api/')) {
                        event.waitUntil(
                            self.registration.sync.register('sync-queue')
                        );
                    }
                    return new Response(JSON.stringify({ error: 'Offline' }), {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({ 'Content-Type': 'application/json' })
                    });
                })
        );
        return;
    }
});

// Background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-queue') {
        event.waitUntil(syncOfflineData());
    }
});

/**
 * Sync offline data when back online
 */
async function syncOfflineData() {
    try {
        // This will be handled by the sync manager in the main thread
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
            client.postMessage({
                type: 'SYNC_DATA',
                message: 'Device is back online'
            });
        });
    } catch (error) {
        console.error('Sync error:', error);
    }
}

// Push notifications (for future features)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'New notification',
        icon: '/assets/icon-192x192.png',
        badge: '/assets/badge-72x72.png',
        tag: 'edurural-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'EduRural STEM', options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open the app
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

console.log('Service Worker loaded');
