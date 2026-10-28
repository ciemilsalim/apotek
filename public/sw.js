// Apotek Sehat - Service Worker for PWA
const CACHE_NAME = 'apotek-sehat-v3';
const PRECACHE_ASSETS = [
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
    // Only handle GET requests with http/https schemes
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    const url = new URL(event.request.url);

    // CRITICAL: NEVER cache or intercept HTML navigation requests or dynamic auth/app pages!
    // This prevents stale CSRF tokens (HTTP 419 Page Expired) and stale session states.
    if (
        event.request.mode === 'navigate' ||
        event.request.headers.get('accept')?.includes('text/html') ||
        event.request.headers.get('X-Inertia')
    ) {
        return; // Always bypass service worker for dynamic HTML and Inertia navigation
    }

    // Cache-first for truly static assets (icons, build assets, fonts)
    if (
        url.pathname.startsWith('/icons/') ||
        url.pathname.startsWith('/build/assets/') ||
        url.hostname.includes('fonts.gstatic.com')
    ) {
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
    }
});
