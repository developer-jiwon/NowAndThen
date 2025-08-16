/**
 * 순수 웹 푸시용 서비스 워커
 * Firebase 없이 순수 Web Push API만 사용
 */

// 서비스 워커 버전
const CACHE_VERSION = 'webpush-v2';
const CACHE_NAME = `nowandthen-webpush-${CACHE_VERSION}`;

// 설정 저장용 변수들
let notificationSettings = null;
let userTimezone = 'UTC';
let countdownData = [];

console.log('=== WEB PUSH SERVICE WORKER LOADED ===');

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting(); // 즉시 활성화
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
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

// Push 이벤트 처리
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);
  
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
      // 테스트 알림
      self.registration.showNotification('테스트 알림', {
        body: '웹 푸시가 정상 작동합니다!',
        icon: '/favicon.ico',
        tag: 'test',
        requireInteraction: true
      });
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

  // ±2분 허용
  const targetMinutes = targetHour * 60 + targetMinute;
  const currentMinutes = currentHour * 60 + currentMinute;
  const timeDiff = Math.abs(targetMinutes - currentMinutes);

  console.log(`[SW] Daily summary check: ${currentHour}:${currentMinute} vs ${targetHour}:${targetMinute} (diff: ${timeDiff}min)`);

  if (timeDiff <= 2) {
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

// 주기적 체크를 위한 타이머 설정
function startPeriodicCheck() {
  console.log('[SW] Starting periodic notification check...');
  
  // 매분마다 체크 (중복 방지를 위해 초 단위는 체크하지 않음)
  setInterval(() => {
    checkNotifications();
  }, 60 * 1000); // 1분
}

// 서비스 워커가 활성화되면 주기적 체크 시작
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.resolve().then(() => {
      startPeriodicCheck();
    })
  );
});

console.log('[SW] Web Push Service Worker ready');