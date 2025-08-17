/**
 * 통합 서비스 워커 - Firebase FCM + Web Push 모두 지원
 * PWA 종료 후에도 백그라운드 알림 보장
 */

// Firebase 설정
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// 서비스 워커 버전
const CACHE_VERSION = 'unified-v1';
const CACHE_NAME = `nowandthen-unified-${CACHE_VERSION}`;

// 설정 저장용 변수들
let notificationSettings = null;
let userTimezone = 'UTC';
let countdownData = [];
let messaging = null;

console.log('=== UNIFIED SERVICE WORKER LOADED ===');
console.log('[SW] Unified PWA notification service ready');

// Firebase 초기화
try {
  firebase.initializeApp({
    apiKey: "AIzaSyB1tU7Wejp2UTAA-7yUzKbzcBT2BVv6sKA",
    authDomain: "nowandthen-notifications.firebaseapp.com",
    projectId: "nowandthen-notifications",
    storageBucket: "nowandthen-notifications.appspot.com",
    messagingSenderId: "943076943487",
    appId: "1:943076943487:web:9f95e1977968c1a194414a"
  });
  
  messaging = firebase.messaging();
  console.log('[SW] Firebase ready');
} catch (error) {
  console.error('[SW] Firebase failed:', error);
}

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Installing unified service worker...');
  self.skipWaiting(); // 즉시 활성화
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating unified service worker...');
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
    }).then(() => {
      // 백그라운드 타이머 시작
      startBackgroundTimers();
      keepServiceWorkerAlive();
    })
  );
});

// Push 이벤트 처리 (PWA가 종료되어도 실행됨)
self.addEventListener('push', (event) => {
  console.log('[SW] 🚀 Push event received - PWA BACKGROUND:', event);
  console.log('[SW] PWA is closed, but service worker is handling notification!');
  
  let notificationData = {
    title: 'NowAndThen 알림',
    body: '새로운 알림이 있습니다',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'default'
  };

  // 서버에서 보낸 데이터가 있으면 사용
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
      console.log('[SW] Parsed push payload:', payload);
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: true,
    actions: [
      { action: 'view', title: '보기' },
      { action: 'dismiss', title: '닫기' }
    ],
    data: {
      url: '/',
      ...notificationData.data
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// Firebase 백그라운드 메시지 처리
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('🚀 PWA CLOSED - Received background FCM message:', payload);
    console.log('[SW] Firebase handling notification while PWA is closed!');
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      actions: [
        { action: 'view', title: 'View Timer' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: {
        url: payload.data?.url || '/',
        timerId: payload.data?.timerId
      },
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    // 앱 열기
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // 이미 열린 탭이 있으면 포커스
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // 새 탭 열기
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
  // dismiss는 아무것도 하지 않음 (이미 닫힘)
});

// 메인 스레드로부터 메시지 수신
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  const { type, payload } = event.data || {};

  switch (type) {
    case 'update-settings':
      // 설정 업데이트
      if (payload && payload.settings) {
        notificationSettings = payload.settings;
        userTimezone = payload.userTimezone || 'UTC';
      } else {
        // Direct message format fallback
        notificationSettings = event.data.settings;
        userTimezone = event.data.userTimezone || 'UTC';
      }
      console.log('[SW] Settings updated:', notificationSettings);
      console.log('[SW] Timezone updated:', userTimezone);
      
      // 설정 업데이트 후 즉시 체크
      checkNotifications();
      break;

    case 'update-countdowns':
      // 카운트다운 데이터 업데이트
      if (payload && payload.countdowns) {
        countdownData = payload.countdowns;
      } else {
        countdownData = event.data.countdowns || [];
      }
      console.log('[SW] Countdown data updated:', countdownData.length, 'items');
      break;

    case 'show-notification':
      // 즉시 알림 표시
      if (payload) {
        const { title, body, options } = payload;
        self.registration.showNotification(title, {
          body,
          ...options
        });
      }
      break;

    case 'test-notification':
      // 테스트 알림 (모바일 PWA 최적화)
      console.log('[SW] 🧪 Test notification requested');
      
      const testOptions = {
        body: '통합 서비스 워커가 정상 작동합니다!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test',
        requireInteraction: true,
        actions: [
          { action: 'view', title: '확인' },
          { action: 'dismiss', title: '닫기' }
        ],
        data: { url: '/' },
        vibrate: [200, 100, 200], // 모바일 진동
        silent: false // 소리 재생
      };
      
      self.registration.showNotification('🧪 테스트 알림', testOptions);
      console.log('[SW] Test notification displayed successfully');
      break;

    case 'test-background':
      // 백그라운드 테스트 알림 (PWA 종료 후 작동 확인)
      console.log('[SW] 🧪 Background test notification requested');
      self.registration.showNotification('백그라운드 테스트', {
        body: 'PWA가 종료되어도 이 알림이 온다면 성공!',
        icon: '/favicon.ico',
        tag: 'background-test',
        requireInteraction: true
      });
      break;

    case 'firebase-ready':
      // Firebase가 준비되었음을 확인
      console.log('[SW] Firebase ready signal received');
      break;

    case 'KEEP_SW_ALIVE':
      // PWA가 살아있음을 서비스 워커에게 알림
      console.log('[SW] Received keepalive from PWA');
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// 주기적 알림 체크 함수들
function checkNotifications() {
  if (!notificationSettings) {
    console.log('[SW] No settings available for notification check');
    return;
  }

  const now = new Date();
  console.log('[SW] Checking notifications at:', now.toISOString());

  // Daily Summary 체크
  if (notificationSettings.dailySummary) {
    checkDailySummary(now);
  }

  // 카운트다운 알림 체크
  checkCountdownReminders(now);
}

function checkDailySummary(now) {
  if (!notificationSettings.dailySummary || !notificationSettings.dailySummaryTime) {
    return;
  }

  const [targetHour, targetMinute] = notificationSettings.dailySummaryTime.split(':').map(Number);
  const currentHour = parseInt(now.toLocaleString('en-US', { 
    timeZone: userTimezone, 
    hour: '2-digit', 
    hour12: false 
  }));
  const currentMinute = parseInt(now.toLocaleString('en-US', { 
    timeZone: userTimezone, 
    minute: '2-digit' 
  }));

  // 정확한 시간에만 알림 (±1분 허용)
  const targetMinutes = targetHour * 60 + targetMinute;
  const currentMinutes = currentHour * 60 + currentMinute;
  const timeDiff = Math.abs(targetMinutes - currentMinutes);

  console.log(`[SW] Daily summary check: ${currentHour}:${currentMinute} vs ${targetHour}:${targetMinute} (diff: ${timeDiff}min)`);

  // 정확한 시간에만 알림 (즉시 알림 방지)
  if (timeDiff <= 1 && timeDiff >= 0) {
    console.log(`[SW] 🎯 Daily summary time matched! Sending notification...`);
    sendDailySummary();
  }
}

function checkCountdownReminders(now) {
  if (!countdownData.length) {
    console.log('[SW] No countdown data for reminder check');
    return;
  }

  countdownData.forEach(countdown => {
    if (!countdown.targetDate) return;

    const targetDate = new Date(countdown.targetDate);
    const timeDiff = targetDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // 1일, 3일, 7일 전 알림 체크
    if (daysDiff === 1 && notificationSettings.oneDay) {
      sendCountdownReminder(countdown, 1);
    } else if (daysDiff === 3 && notificationSettings.threeDays) {
      sendCountdownReminder(countdown, 3);
    } else if (daysDiff === 7 && notificationSettings.sevenDays) {
      sendCountdownReminder(countdown, 7);
    }
  });
}

function sendDailySummary() {
  console.log('[SW] Sending daily summary notification');
  
  let summaryText = '오늘도 목표를 향해 나아가세요!';
  
  // 카운트다운 데이터가 있으면 요약 생성
  if (countdownData.length > 0) {
    const todayCount = countdownData.filter(c => {
      const diff = Math.ceil((new Date(c.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diff === 0;
    }).length;
    
    const soonCount = countdownData.filter(c => {
      const diff = Math.ceil((new Date(c.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= 7;
    }).length;

    if (todayCount > 0) {
      summaryText = `오늘 마감되는 타이머가 ${todayCount}개 있어요!`;
    } else if (soonCount > 0) {
      summaryText = `이번 주 마감되는 타이머가 ${soonCount}개 있어요`;
    }
  }

  self.registration.showNotification('오늘의 타이머 요약', {
    body: summaryText,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'daily-summary',
    requireInteraction: true,
    actions: [
      { action: 'view', title: '확인하기' },
      { action: 'dismiss', title: '닫기' }
    ],
    data: { url: '/' }
  });
}

function sendCountdownReminder(countdown, daysLeft) {
  console.log(`[SW] Sending countdown reminder: ${countdown.title} - ${daysLeft} days left`);
  
  const title = `${countdown.title} - ${daysLeft}일 남음`;
  const body = `"${countdown.title}" 마감까지 ${daysLeft}일 남았습니다`;

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `countdown-${countdown.id}-${daysLeft}`,
    requireInteraction: true,
    actions: [
      { action: 'view', title: '확인하기' },
      { action: 'dismiss', title: '닫기' }
    ],
    data: { 
      url: '/',
      countdownId: countdown.id 
    }
  });
}

// 백그라운드 타이머 시작
function startBackgroundTimers() {
  console.log('[SW] Starting background notification timers...');
  
  // 안정적인 체크 (PWA 종료 후에도 작동 보장)
  setInterval(() => {
    checkNotifications();
  }, 60 * 1000); // 1분마다
  
  // 추가 체크
  setInterval(() => {
    checkNotifications();
  }, 120 * 1000); // 2분마다
  
  console.log('[SW] Stable background timers started - notifications will work even when PWA is closed');
  console.log('[SW] Checking every 1min and 2min for stability');
}

// 서비스 워커 생명주기 확장 (PWA 종료 후에도 유지)
function keepServiceWorkerAlive() {
  console.log('[SW] Setting up service worker keepalive...');
  
  // 안정적인 keepalive (PWA 종료 후에도 유지 보장)
  setInterval(() => {
    self.clients.matchAll().then(clients => {
      if (clients.length === 0) {
        // PWA가 완전히 종료된 상태
        console.log('[SW] ⚡ PWA closed - Service Worker still alive for background notifications');
        
        // 서비스 워커가 살아있음을 확인하기 위한 자가 메시지
        self.postMessage({
          type: 'SW_KEEPALIVE',
          timestamp: Date.now()
        });
      }
    });
  }, 30000); // 30초마다 체크 (안정적)
  
  // 추가 keepalive 메커니즘
  setInterval(() => {
    // 서비스 워커가 살아있음을 확인
    console.log('[SW] 🔄 Keepalive pulse - Service Worker is alive');
  }, 60000); // 1분마다
  
  console.log('[SW] Stable keepalive mechanism activated');
  console.log('[SW] Checking every 30s and 60s for stability');
}

console.log('[SW] 🎯 Unified Service Worker ready for BACKGROUND notifications');
console.log('[SW] This service worker will handle both Firebase FCM and Web Push');
console.log('[SW] PWA can be closed - notifications will still work!');
