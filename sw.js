// JQ Service Worker — v3 (force refresh)
const CACHE = 'jq-cache-v3';
const ASSETS = [
  '/JQ-shop/',
  '/JQ-shop/index.html',
  '/JQ-shop/manifest.json',
  '/JQ-shop/logo.svg',
  '/JQ-shop/logo.png',
  '/JQ-shop/icon-192.png',
  '/JQ-shop/icon-512.png',
  '/JQ-shop/apple-touch-icon.png',
];

// Install — cache assets
self.addEventListener('install', e => {
  self.skipWaiting(); // force activate immediately
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

// Activate — delete ALL old caches immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if(k !== CACHE) {
          console.log('JQ SW: deleting old cache', k);
          return caches.delete(k);
        }
      }))
    ).then(() => self.clients.claim()) // take control immediately
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Always fetch fresh for HTML files
  if(e.request.url.includes('.html') || e.request.url.endsWith('/JQ-shop/')) {
    e.respondWith(
      fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache first for assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      });
    })
  );
});
