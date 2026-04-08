const CACHE_NAME = 'ratio-game-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 安裝時快取本地核心檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 攔截網路請求，實現離線支援
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 1. 如果快取中有資料，直接回傳快取 (最快)
        if (response) {
            return response;
        }
        
        // 2. 如果快取沒有，則透過網路抓取
        return fetch(event.request).then(fetchResponse => {
            // 確認請求是否有效，且我們只快取 GET 請求與 http/https 協定的資源 (避免外掛錯誤)
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic' && fetchResponse.type !== 'cors' || event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
                return fetchResponse;
            }

            // 動態將外部 CDN 的資源 (Tailwind, Lucide) 也存入快取
            let responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
        });
      })
  );
});