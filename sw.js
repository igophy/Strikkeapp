const APP_VERSION = '1.8.1';
const STATIC_CACHE = `inges-strikkehjelp-static-v${APP_VERSION}`;
const PAGE_CACHE = `inges-strikkehjelp-pages-v${APP_VERSION}`;
const ASSETS = [
    './',
    './index.html',
    './style.css?v=1.8.1',
    './app.js?v=1.8.1',
    './strikketips.json',
    './logo.svg',
    './manifest.json?v=1.8.1',
    './yarn-data.js?v=1.8.1',
    './icon-192.png',
    './icon-512.png',
    './apple-touch-icon.png?v=1.8.1',
    './favicon-64.png?v=1.8.1'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter(key => ![STATIC_CACHE, PAGE_CACHE].includes(key))
                .map(key => caches.delete(key))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const request = event.request;
    const url = new URL(request.url);
    const isSameOrigin = url.origin === self.location.origin;

    if (!isSameOrigin) return;

    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            const pageCache = await caches.open(PAGE_CACHE);
            try {
                const fresh = await fetch(request, { cache: 'no-store' });
                pageCache.put(request, fresh.clone());
                return fresh;
            } catch (error) {
                return (await pageCache.match(request)) || (await caches.match('./index.html'));
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const staticCache = await caches.open(STATIC_CACHE);
        const cached = await staticCache.match(request);
        if (cached) {
            fetch(request).then(response => {
                if (response && response.ok) {
                    staticCache.put(request, response.clone());
                }
            }).catch(() => null);
            return cached;
        }

        try {
            const response = await fetch(request);
            if (response && response.ok) {
                staticCache.put(request, response.clone());
            }
            return response;
        } catch (error) {
            return cached;
        }
    })());
});
