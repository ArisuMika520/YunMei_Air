// 自定义 Service Worker 配置
// 这个文件会被 next-pwa 自动合并到生成的 sw.js 中

const CACHE_NAME = 'yunmei-air-v1';
const OFFLINE_URL = '/offline.html';

// 需要预缓存的关键资源
const PRECACHE_URLS = [
  '/',
  '/locks',
  '/login',
  '/offline.html'
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch 事件 - 网络优先策略（适合需要实时数据的应用）
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 跳过 chrome-extension 和非 http(s) 请求
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果网络请求成功，更新缓存
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // 网络失败，尝试从缓存读取
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // 如果是导航请求且缓存中没有，返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // 其他情况返回 404
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
});

// 监听消息（用于手动触发更新等）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    console.log('[SW] Caching URLs:', event.data.urls);
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

// 后台同步（可选 - 用于离线时的数据同步）
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-locks') {
    event.waitUntil(
      // 这里可以添加同步锁状态的逻辑
      Promise.resolve()
    );
  }
});

// 推送通知（可选）
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : '您有新的通知',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看',
        icon: '/icon-72.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icon-72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('云莓Air', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker loaded successfully! 🚀');


