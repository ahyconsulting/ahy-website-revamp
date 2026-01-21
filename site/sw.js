const CACHE_NAME = 'ahy-cache-v1';
const PRECACHE_URLS = [
    '/',
    '/index.html'
    // We rely mostly on runtime caching to capture versioned assets (e.g. main.js?v=dev)
];

self.addEventListener('install', (event) => {
    // Install immediately
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
    );
});

self.addEventListener('activate', (event) => {
    // Take control of all clients immediately
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== CACHE_NAME) {
                            return caches.delete(cache);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-http requests
    if (!url.protocol.startsWith('http')) return;

    // 1. Cache First for Static Assets & Components
    //    This ensures consecutive loads are minimal/instant
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|mp4|webm|avif|webp)$/) ||
        url.pathname.includes('/components/') ||
        url.pathname.includes('/assets/')
    ) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request).then((networkResponse) => {
                    // Check if valid response
                    if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0)) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return networkResponse;
                });
            })
        );
        return;
    }

    // 2. Stale-While-Revalidate for HTML Pages
    //    Provides instant load (if cached) while updating in background
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch((err) => {
                    // Network failed, nothing to do if no cache
                    console.log('Network fetch failed for page', err);
                });

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }
});
