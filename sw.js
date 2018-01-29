// 当前缓存版本
const CACHE_STORAGE_KEY = 'v1';

const CACHE_LIST = [
  '/',
  'index.html',
  'js/app.js',
  'js/index.js',
  'css/main.css',
  'favicon.ico',
  'imgs/icon-60.png',
  'imgs/icon-144.png',
  'manifest.json'
];

// 处理跨域请求时要用到
const host = location.host;

function isCORSRequest(url) {
  return url.search(host) === -1;
}

// 并存该函数为日后拓展所用
function handleFetchRequest(req) {
  const request = isCORSRequest(req.url) ?
    new Request(req.url, { mode: 'cors' })
    : req;
  fetch(req);
}

// 脚本安装时
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STORAGE_KEY)
      .then(cache => cache.addAll(CACHE_LIST))
      // 保证在页面更新过程中，新的Service Worker脚本能立即激活生效
      .then(() => self.skipWaiting())
  )
});

// 通过脚本fetch数据
self.addEventListener('fetch', event => {
  if (isCORSRequest(event.request.url)) {
    return;
  }
  event.respondWith(
    // 先在cache中找
    caches.match(event.request).then(res => {
      // cache中没有再使用fetch
      return res || handleFetchRequest(event.request);
    })
  );
});

// 更新静态资源
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(name => {
        if (name !== CACHE_STORAGE_KEY) {
          return caches.delete(name);
        }
      }));
    })
  );
});