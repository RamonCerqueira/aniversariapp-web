// Service Worker básico para evitar erros 404 e permitir instalação PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estratégia de rede apenas por enquanto
  event.respondWith(fetch(event.request));
});
