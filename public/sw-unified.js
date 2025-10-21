/**
 * 간단한 서비스 워커 - 최소 기능만 유지
 * 알림 기능은 App Store 출시 시 활성화 예정
 */

// 서비스 워커 버전
const CACHE_VERSION = 'simple-v2';
const CACHE_NAME = `nowandthen-simple-${CACHE_VERSION}`;

console.log('=== SIMPLE SERVICE WORKER LOADED ===');
console.log('[SW] Minimal PWA service worker ready');

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting(); // 즉시 활성화
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients...');
      return self.clients.claim();
    })
  );
});

/*
 * ===================================================================
 * 알림 기능 - App Store 출시 시 활성화 예정
 * ===================================================================
 *
 * // Web Push 이벤트 처리
 * self.addEventListener('push', (event) => {
 *   console.log('[SW] Push event received:', event);
 *   // ... push 처리 로직
 * });
 *
 * // 알림 클릭 처리
 * self.addEventListener('notificationclick', (event) => {
 *   console.log('[SW] Notification clicked:', event);
 *   event.notification.close();
 *   // ... 클릭 처리 로직
 * });
 *
 * // 메인 스레드로부터 메시지 수신
 * self.addEventListener('message', (event) => {
 *   const { type, payload } = event.data || {};
 *   switch (type) {
 *     case 'update-settings':
 *     case 'update-countdowns':
 *     case 'show-notification':
 *     case 'test-notification':
 *       // ... 메시지 처리 로직
 *       break;
 *   }
 * });
 *
 * ===================================================================
 */

// 기본 메시지 리스너 (확장 가능)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  // 향후 확장을 위한 기본 구조
  const { type } = event.data || {};

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker ready');
console.log('[SW] Notification features will be enabled for App Store release');
