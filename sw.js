// Offline shell for the Albert & Milly app. Data and photos sync through GitHub, not this cache.
const SHELL = 'am-shell-v15';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== 'am-photos').map(k => caches.delete(k)))));
  self.clients.claim();
});
function pageKey(u) { return u.pathname.indexOf('/beta/') >= 0 ? './beta/index.html' : './index.html'; }
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    // Always try for the newest version first, fall back to the saved copy when offline.
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => { const copy = r.clone(); caches.open(SHELL).then(c => c.put(pageKey(url), copy)); return r; })
      .catch(() => caches.match(pageKey(url))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
