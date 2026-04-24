// Service Worker — Tekno Automazione
const CACHE_NAME = 'tekno-v2';
const ASSETS = [
  './tekno-automazione-v2.html',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Installa e mette in cache le risorse
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.log('Cache parziale:', err);
      });
    })
  );
  self.skipWaiting();
});

// Attiva e pulisce cache vecchie
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Intercetta richieste: prima rete, poi cache
self.addEventListener('fetch', event => {
  // Ignora richieste Google API (devono andare sempre in rete)
  const url = event.request.url;
  if (url.includes('googleapis.com') || url.includes('google.com') || url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Aggiorna cache con risposta fresca
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: restituisce dalla cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback per navigazione
          if (event.request.mode === 'navigate') {
            return caches.match('./tekno-automazione-v2.html');
          }
        });
      })
  );
});
