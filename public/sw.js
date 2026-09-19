const CACHE_VERSION = 'v4';
const STATIC_CACHE = `casa-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `casa-runtime-${CACHE_VERSION}`;
const API_CACHE = `casa-api-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(
              key => key !== STATIC_CACHE && key !== RUNTIME_CACHE && key !== API_CACHE
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (request.method !== 'GET') return;

  // Never cache Next.js RSC payloads. They drive client-side navigation and
  // must always come from the network, otherwise pages render stale designs.
  if (url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') return;

  // Full page navigations: always go to the network, fall back to offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const offlinePage = await caches.match(OFFLINE_URL);
        return (
          offlinePage ||
          new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/html' },
          })
        );
      })
    );
    return;
  }

  // Content-hashed build output and icons are safe to serve cache-first.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // API responses and uploaded media: network-first so data stays fresh.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Everything else (public assets, images): network-first with cache fallback.
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const res = await fetch(request);
    if (res.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlinePage = await caches.match(OFFLINE_URL);
    if (request.headers.get('accept')?.includes('text/html')) {
      return (
        offlinePage ||
        new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/html' },
        })
      );
    }
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
