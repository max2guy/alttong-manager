// ★ 캐시 이름을 v3.1로 변경 (이러면 이전 캐시를 다 버리고 새로 받음)
const CACHE_NAME = 'alttong-v3.1'; 

const ASSETS = [
  './',
  './index.html?v=3.1', // 여기도 쿼리스트링 맞춤
  './style.css?v=3.1',
  './app.js?v=3.1',
  './manifest.json?v=3.1',
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
        // 현재 버전(3.1)이 아닌 옛날 캐시는 싹 삭제
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
