const CACHE_NAME = 'now-and-then-v3';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        if ('caches' in self) {
          const cache = await caches.open(CACHE_NAME);
          await cache.addAll([OFFLINE_URL]);
        }
      } catch (error) {
        console.error('Cache install failed:', error);
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) return;
  
  const data = event.data.json();
  const title = data.title || '⏰ Now & Then';
  const options = {
    body: data.body || 'Timer notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: data.image, // 큰 이미지 (선택사항)
    actions: [
      { action: 'view', title: '타이머 보기', icon: '/icon-view.png' },
      { action: 'snooze', title: '5분 후 다시', icon: '/icon-snooze.png' },
      { action: 'dismiss', title: '닫기', icon: '/icon-close.png' }
    ],
    data: {
      url: data.url || '/',
      timerId: data.timerId
    },
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200], // 진동 패턴
    tag: 'nowandthen-timer',
    renotify: true, // 같은 태그면 새 알림으로 교체
    timestamp: Date.now(),
    // 커스텀 스타일링
    silent: false, // 소리 있음
    dir: 'ltr', // 텍스트 방향
    lang: 'ko-KR' // 언어
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const { action } = event;
  const { url, timerId } = event.notification.data;
  
  if (action === 'view' || !action) {
    // 타이머 보기 - 앱 열기
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  } else if (action === 'snooze') {
    // 5분 후 다시 알림
    setTimeout(() => {
      self.registration.showNotification('⏰ 스누즈 알림', {
        body: '5분 전에 미룬 타이머입니다',
        icon: '/icon-192x192.png',
        tag: 'nowandthen-snooze',
        actions: [
          { action: 'view', title: '타이머 보기' },
          { action: 'dismiss', title: '닫기' }
        ],
        data: { url, timerId }
      });
    }, 5 * 60 * 1000); // 5분 후
  } else if (action === 'dismiss') {
    // 그냥 닫기 - 아무것도 안함
    console.log('Notification dismissed');
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only use offline fallback for HTML navigations. If it's an image (like apple-touch-icon)
  // let the network handle it to avoid serving the HTML offline page for image requests.
  if (request.mode === 'navigate') {
    const accept = request.headers.get('accept') || '';
    const isHtml = accept.includes('text/html');
    if (isHtml) {
      event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
      return;
    }
    // Not HTML navigation (e.g., direct PNG), fall through to default network behavior
    return;
  }

  // Avoid caching apple-touch-icon to prevent stale A2HS icon on iOS
  const url = new URL(request.url);
  if (url.pathname.includes('apple-touch-icon')) {
    return; // allow default network behavior
  }

  // Static assets/API: cache-first, then network fallback and cache update
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => cached);
    })
  );
});


