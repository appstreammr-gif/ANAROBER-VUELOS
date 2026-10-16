// Service Worker — DOLI ANAROBER v2.1 (ACTUALIZADO)
const CACHE_NOMBRE = 'doli-anarober-v2-1'; // ✅ NUEVO NOMBRE = BORRA LO VIEJO
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './config.js',
  './Ventana_encargado1.html',
  './Ventana_encargado2.html',
  './Ventana_encargado3.html',
  './Ventana_encargado4.html',
  './Ventana_encargado5.html',
  './ANAROBER.html'
];

// Instalar con archivos nuevos
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NOMBRE)
      .then(cache => {
        console.log('✅ Caché nueva instalada');
        return cache.addAll(ARCHIVOS_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Borrar TODA la caché vieja automáticamente
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(nombres => {
      return Promise.all(
        nombres.filter(n => n !== CACHE_NOMBRE)
          .map(n => {
            console.log('🗑️ Borrando caché vieja:', n);
            return caches.delete(n);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// SIEMPRE buscar la versión nueva primero
self.addEventListener('fetch', evento => {
  // No guardar archivos del servidor en caché
  if (evento.request.url.includes('trycloudflare.com') || 
      evento.request.url.includes('socket.io')) {
    return fetch(evento.request);
  }

  evento.respondWith(
    fetch(evento.request) // ✅ BUSCA SIEMPRE LA VERSIÓN NUEVA
      .then(respuestaRed => {
        caches.open(CACHE_NOMBRE).then(cache => {
          cache.put(evento.request, respuestaRed.clone());
        });
        return respuestaRed;
      })
      .catch(() => {
        return caches.match(evento.request);
      })
  );
});