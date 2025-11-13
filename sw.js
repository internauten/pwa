const CACHE_NAME = 'my-pwa-v12';
const urlsToCache = [
    '/',
    '/index.html',
    '/test-update.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    // Skip waiting to activate new service worker immediately
    self.skipWaiting();
});

// Message handler for manual update trigger
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch cached assets when offline, with network-first strategy for HTML
self.addEventListener('fetch', (event) => {
    // Network-first strategy for HTML pages to get updates faster
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone and cache the new version
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, fall back to cache
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || new Response('Network error and no cache available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
                })
        );
    } else {
        // Cache-first strategy for other resources (CSS, JS, images)
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then(
                        (response) => {
                            // Check if valid response
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }

                            // Clone the response
                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        }
                    );
                })
        );
    }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
