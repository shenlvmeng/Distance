// 当前缓存版本
const cacheStorageKey = 'v2';

const cacheList = [
  '/',
  'index.html',
  'js/app.js',
  'css/main.css',
  'favicon.ico',
  'imgs/icon-60.png',
  'imgs/icon-114.png',
  'manifest.json'
];

// 脚本安装时
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheStorageKey)
      .then(cache => cache.addAll(cacheList))
      // 保证在页面更新过程中，新的Service Worker脚本能立即激活生效
      .then(() => self.skipWaiting())
  )
});

// 通过脚本fetch数据
self.addEventListener('fetch', event => {
  event.respondWith(
    // 先在cache中找
    caches.match(event.request).then(res => {
      // cache中没有再使用fetch
      return res || fetch(event.request.url);
    })
  )
});

// 更新静态资源
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(name => {
        if (name !== cacheStorageKey) {
          return caches.delete(name);
        }
      }));
    })
  );
});