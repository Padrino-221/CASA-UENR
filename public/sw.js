const STATIC_CACHE = 'casa-static-v7';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [OFFLINE_URL, '/manifest.webmanifest', '/casa-icon-round-192.png', '/casa-icon-round-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('casa-') && key !== STATIC_CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.method !== 'GET') return;
  // Authenticated data, development scripts, and RSC always use the network.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/@') ||
      url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match(OFFLINE_URL)) || new Response('Offline', { status: 503 })
    ));
    return;
  }
  // Only immutable build files are cached; never store redirects or HTML as JS.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      const type = response.headers.get('Content-Type') || '';
      if (response.ok && !response.redirected && !type.includes('text/html')) {
        await cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
