// Offline shell for the Albert & Milly app. Data and photos sync through GitHub, not this cache.
const SHELL = 'am-shell-v61';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192-v5.png', './icon-512-v5.png', './apple-touch-icon-v5.png', './nunito-v1.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== 'am-photos').map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  const scope = new URL('./', self.registration.scope).pathname;
  const isApp = url.pathname === scope || url.pathname === scope + 'index.html';
  // Other pages on the site (like about/) are left alone.
  if (e.request.mode === 'navigate' && !isApp) return;
  if (isApp) {
    // Always try for the newest version first, fall back to the saved copy when offline.
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => { const copy = r.clone(); caches.open(SHELL).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
