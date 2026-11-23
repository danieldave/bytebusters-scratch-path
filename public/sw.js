// Offline support. Bump VERSION when you change app files so phones refresh.
const VERSION = 'bbp-v3';
const SHELL = ['/', '/style.css', '/app.js', '/data/path.json', '/data/manifests.json', '/manifest.webmanifest', '/icon.svg', '/lab.js', '/php-lite.js', '/data/web.json', '/assets/stall.svg', '/assets/basket.svg', '/assets/coin.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/admin') || u.pathname.startsWith('/parent')) return;
  const heavy = u.pathname.startsWith('/files/') || u.pathname.startsWith('/vendor/') || u.pathname === '/player.html';
  if (heavy) { // cache-first: big files are downloaded once
    e.respondWith(caches.open(VERSION).then((c) => c.match(r).then((m) => m || fetch(r).then((x) => { if (x.ok) c.put(r, x.clone()); return x; }))));
  } else { // fresh when online, cached when offline
    e.respondWith(fetch(r).then((x) => { if (x.ok) caches.open(VERSION).then((c) => c.put(r, x.clone())); return x; }).catch(() => caches.match(r).then((m) => m || caches.match('/'))));
  }
});
