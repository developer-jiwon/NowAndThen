/**
 * 간단한 서비스 워커 - Web Push 전용
 * PWA 종료 후에도 백그라운드 알림 보장
 */

// 서비스 워커 버전
const CACHE_VERSION = 'simple-v1';
const CACHE_NAME = `nowandthen-simple-${CACHE_VERSION}`;

// 설정 저장용 변수들
let notificationSettings = null;
let userTimezone = 'UTC';
let countdownData = [];

console.log('=== SIMPLE SERVICE WORKER LOADED ===');
console.log('[SW] Simple PWA notification service ready');

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Installing unified service worker...');
  self.skipWaiting(); // 즉시 활성화
  
  // 설치 즉시 백그라운드 작업 시작
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('[SW] Starting background work immediately after install...');
      startBackgroundTimers();
      keepServiceWorkerAlive();
    })
  );
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

self.dedupMap = self.dedupMap || new Map();

function swBeacon(event, extra) {
	try {
		const payload = {
			ts: Date.now(),
			event,
			...extra
		};
		// Use fetch keepalive so it works during termination
		fetch('/api/sw-log', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
			keepalive: true
		}).catch(() => {});
	} catch (_) {}
}

// mark SW load
swBeacon('SW_LOADED');

// Web Push 이벤트 처리 (지연 알림 지원 + 중복 방지)
self.addEventListener('push', (event) => {
  console.log('[SW] 🚀 Push event received:', event);
  swBeacon('PUSH_RECEIVED');
  
  // 중복 푸시 방지를 위한 고유 ID
  let pushId = Date.now();
  try {
    if (event.data) {
      const t = JSON.parse(event.data.text());
      pushId = t?.data?.id || t?.data?.timestamp || pushId;
    }
  } catch (_) {}
  
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
      
      // 지연 알림: 클라에서 delay 메타로 전송된 경우
      if (payload.data && payload.data.type === 'delayed' && payload.data.delay) {
        const id = payload.data.id || pushId;
        const delay = Number(payload.data.delay) || 10000;
        const tag = 'test-delayed';
        if (self.dedupMap.get(id)) {
          console.log('[SW] 🔁 Duplicate delayed push ignored:', id);
          return;
        }
        self.dedupMap.set(id, true);
        console.log('[SW] 🕐 Delayed (client-meta) notification, id:', id, 'delay:', delay);
        setTimeout(() => {
          self.registration.getNotifications({ includeTriggered: true }).then(notis => {
            notis.forEach(n => { if (n.tag === tag) n.close(); });
            const opts = {
              body: notificationData.body,
              icon: notificationData.icon,
              badge: notificationData.badge,
              tag,
              requireInteraction: true,
              data: { url: '/', id }
            };
            self.registration.showNotification(notificationData.title, opts);
            console.log('[SW] ✅ Shown delayed (client-meta) id:', id);
          });
        }, delay);
        return;
      }
      
      // 서버가 이미 지연 후 발사한 경우(type:'delayed-server') 즉시 표시
      if (payload.data && payload.data.type === 'delayed-server') {
        const id = payload.data.id || pushId;
        const tag = 'test-delayed';
        if (self.dedupMap.get(id)) {
          console.log('[SW] 🔁 Duplicate delayed-server push ignored:', id);
          return;
        }
        self.dedupMap.set(id, true);
        self.registration.getNotifications({ includeTriggered: true }).then(notis => {
          notis.forEach(n => { if (n.tag === tag) n.close(); });
          const opts = {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag,
            requireInteraction: true,
            data: { url: '/', id }
          };
          self.registration.showNotification(notificationData.title, opts);
          console.log('[SW] ✅ Shown delayed-server id:', id);
        });
        return;
      }
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  // 즉시 알림 표시 (지연이 없는 경우)
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: 'default',
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

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  swBeacon('NOTIFICATION_CLICK', { tag: event.notification?.tag });
  
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

// 백그라운드 타이머 시작 (ULTIMATE 강력하게)
function startBackgroundTimers() {
  console.log('[SW] 🚀 Starting ULTIMATE background timers...');
  
  // 다중 강력한 백그라운드 타이머 (더 자주)
  setInterval(() => {
    console.log('[SW] 🔄 Background check every 2 seconds');
    
    // PWA가 백그라운드에 있는지 확인
    self.clients.matchAll().then(clients => {
      const hasActiveClients = clients.length > 0;
      const hasVisibleClients = clients.some(client => client.visibilityState === 'visible');
      
      console.log('[SW] Active clients:', clients.length, 'Visible:', hasVisibleClients);
      
      // PWA가 백그라운드에 있으면 강제로 알림 체크
      if (hasActiveClients && !hasVisibleClients) {
        console.log('[SW] PWA in background - forcing notification check');
        checkNotifications();
      }
    });
    
    // 서비스 워커가 살아있음을 확인
    const timestamp = Date.now();
    console.log('[SW] Service Worker alive at:', timestamp);
    
  }, 2000); // 2초마다
  
  // 추가 백그라운드 체크 (10초마다)
  setInterval(() => {
    console.log('[SW] 🔄 Additional background check every 10 seconds');
    checkNotifications();
  }, 10000);
  
  console.log('[SW] 🎯 ULTIMATE background timers started');
  console.log('[SW] Checking every 2s + 10s to keep alive');
}

// 서비스 워커 생명주기 확장 (ULTIMATE 강력하게)
function keepServiceWorkerAlive() {
  console.log('[SW] 🚀 Setting up ULTIMATE keepalive...');
  
  // 다중 강력한 keepalive (더 자주)
  setInterval(() => {
    console.log('[SW] ⚡ Keepalive every 1 second');
    
    // 서비스 워커가 살아있음을 확인
    const timestamp = Date.now();
    console.log('[SW] Service Worker keepalive at:', timestamp);
    
    // PWA 상태 확인
    self.clients.matchAll().then(clients => {
      if (clients.length === 0) {
        console.log('[SW] ⚡ No active clients - Service Worker still alive');
      } else {
        const visibleClients = clients.filter(client => client.visibilityState === 'visible');
        console.log('[SW] ⚡ Active clients:', clients.length, 'Visible:', visibleClients.length);
      }
    });
    
  }, 1000); // 1초마다
  
  // 추가 keepalive (5초마다)
  setInterval(() => {
    console.log('[SW] ⚡ Additional keepalive every 5 seconds');
    forceKeepalive();
  }, 5000);
  
  console.log('[SW] 🎯 ULTIMATE keepalive activated');
  console.log('[SW] Checking every 1s + 5s to stay alive');
}

// 강제 keepalive 실행 (간단하게)
function forceKeepalive() {
  try {
    // 서비스 워커가 살아있음을 확인
    const timestamp = Date.now();
    console.log('[SW] 🔧 Force keepalive at:', timestamp);
    
    // PWA 상태 확인
    self.clients.matchAll().then(clients => {
      if (clients.length === 0) {
        console.log('[SW] ⚡ PWA closed - Service Worker still alive');
      } else {
        const visibleClients = clients.filter(client => client.visibilityState === 'visible');
        console.log('[SW] ⚡ PWA active - Visible:', visibleClients.length);
      }
    });
    
  } catch (error) {
    console.error('[SW] Keepalive error:', error);
  }
}

// 백그라운드에서 계속 실행되도록 추가 이벤트
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'KEEP_SW_ALIVE') {
    console.log('[SW] Keepalive message received - Service Worker is alive!');
    // 백그라운드 작업 강제 실행
    checkNotifications();
  }
});

// 서비스 워커가 백그라운드에서 계속 실행되도록 주기적 체크 (ULTIMATE)
setInterval(() => {
  console.log('[SW] 🔄 Background heartbeat - Service Worker is running');
  
  // 강제로 알림 체크 실행
  try {
    checkNotifications();
    console.log('[SW] 🔄 Forced notification check from heartbeat');
  } catch (error) {
    console.error('[SW] Heartbeat notification check failed:', error);
  }
}, 5000); // 5초마다

// 추가 강력한 heartbeat (15초마다)
setInterval(() => {
  console.log('[SW] 🔄 ULTIMATE heartbeat - Service Worker is alive and kicking');
  
  // 강제로 keepalive 실행
  forceKeepalive();
  
  // PWA 상태 확인
  self.clients.matchAll().then(clients => {
    console.log('[SW] 🔄 ULTIMATE heartbeat - Clients:', clients.length);
    if (clients.length === 0) {
      console.log('[SW] 🔄 ULTIMATE heartbeat - PWA closed but Service Worker alive!');
    }
  });
}, 15000); // 15초마다

console.log('[SW] 🎯 ULTIMATE Service Worker ready for BACKGROUND notifications');
console.log('[SW] This service worker will handle Web Push notifications');
console.log('[SW] PWA can be closed - notifications will still work!');
console.log('[SW] ULTIMATE background timers: 2s + 10s + 5s + 15s');
