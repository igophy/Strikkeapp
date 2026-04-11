const CACHE_NAME = 'inges-strikkehjelp-v1.7.1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './strikketips.json',
    './logo.svg',
    './manifest.json?v=1.7.1',
    './yarn-data.js',
    './icon-192.png',
    './icon-512.png',
    './apple-touch-icon.png?v=1.7.1',
    './favicon-64.png?v=1.7.1'
];

// Installer: cache alle filer
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Aktiver: slett gamle cacher
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache first, nettverk som fallback
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            const fetchPromise = fetch(e.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => cached);

            return cached || fetchPromise;
        })
    );
});
