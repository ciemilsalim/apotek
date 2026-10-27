// Apotek Sehat - Service Worker for PWA
const CACHE_NAME = 'apotek-sehat-v1';
const PRECACHE_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.svg',
    '/icons/icon-512x512.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('PWA Precache failed for some assets', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and non-http schemes (e.g. chrome-extension)
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    const url = new URL(event.request.url);

    // Cache-first for static icons and fonts
    if (url.pathname.startsWith('/icons/') || url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Network-first for Inertia pages and API data with cache fallback
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    if (event.request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('/');
                    }
                });
            })
    );
});
