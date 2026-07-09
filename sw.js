// Service worker — cachea la app para que funcione sin internet (en el campo).
// Sube el número de versión al cambiar archivos para forzar actualización.
const CACHE = 'cds-v2';
const ASSETS = [
  './',
  './index.html',
  './curso.html',
  './style.css?v=2',
  './crops.js?v=2',
  './app.js?v=2',
  './vendor/marked.min.js',
  './docs/curso-zapallo.md',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
