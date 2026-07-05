/* SCRIB MedNet Go — service worker */
const CACHE = 'mednet-go-v2.0.1';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
    .then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    if (r) return r;
    return fetch(e.request).then(function (resp) {
      try {
        if (resp && resp.ok && new URL(e.request.url).origin === self.location.origin) {
          var cp = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
        }
      } catch (err) {}
      return resp;
    }).catch(function () {
      if (e.request.mode === 'navigate') return caches.match('./index.html');
    });
  }));
});
