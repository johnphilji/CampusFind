// Minimal Service Worker to allow PWA installation
const CACHE_NAME = 'campusfind-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle requests directly
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
