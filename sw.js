// Service worker — permite usar la app sin internet (en el campo).
// Estrategia:
//  · Páginas (index/curso) y el manual .md → RED PRIMERO (siempre lo último; si no hay red, usa caché).
//  · Archivos estáticos (js/css/imágenes) → CACHÉ PRIMERO (rápido).
// Sube CACHE al cambiar archivos para forzar actualización.
const CACHE = 'cds-v4';
const ASSETS = [
  './',
  './index.html',
  './curso.html',
  './style.css?v=3',
  './glosario.js?v=3',
  './gloss.js?v=3',
  './crops.js?v=3',
  './app.js?v=3',
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
  const req = e.request;
  if (req.method !== 'GET') return;

  let path = '';
  try { path = new URL(req.url).pathname; } catch (_) {}
  const esDocumento = req.mode === 'navigate' || req.destination === 'document' || path.endsWith('.md');

  if (esDocumento) {
    // Red primero: trae la versión fresca; si no hay internet, cae a la caché.
    e.respondWith(
      fetch(req)
        .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return r; })
        .catch(() => caches.match(req).then(h => h || caches.match('./curso.html') || caches.match('./index.html')))
    );
  } else {
    // Caché primero para estáticos.
    e.respondWith(caches.match(req).then(h => h || fetch(req)));
  }
});
