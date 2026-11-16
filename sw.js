// Offline shell for the Albert & Milly app. Data and photos sync through GitHub, not this cache.
const SHELL = 'am-shell-v74';
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
// Notifications sent by the data repo's notify workflow (notes and reminders).
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'Albert & Milly', body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Albert & Milly', {
    body: d.body || '', tag: d.tag, icon: 'icon-192-v5.png', badge: 'icon-192-v5.png', data: { url: './?notes=1' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ('focus' in c) return c.focus();
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || './');
  }));
});
