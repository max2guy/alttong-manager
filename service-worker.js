// ★ 캐시 이름 v5.0으로 변경
const CACHE_NAME = 'alttong-v5.0'; 

const ASSETS = [
  './',
  './index.html?v=5.0', // 쿼리스트링 통일
  './style.css?v=5.0',
  './app.js?v=5.0',
  './manifest.json?v=5.0',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        // v5.0이 아닌 구버전 캐시는 모두 삭제
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
