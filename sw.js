// Работа без сети: сначала сеть, при ошибке копия. Только свои файлы, база и вход не кэшируются.
// Номер копии = версия из js/versions.js (тест сверяет). Удаляем только свои копии: префикс проекта.
const PREFIX = 'prodaj-mne-ruchku-';
const KESH = PREFIX + '1.2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIX) && k !== KESH).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/_local/')) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(KESH).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('./'))));
});
