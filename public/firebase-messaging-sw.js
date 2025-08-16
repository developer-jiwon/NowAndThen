// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

let messaging = null;

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

// Timer-based notification functions
function getNotificationSettings() {
  return currentSettings;
}

function getCountdowns() {
  return countdownsData;
}

function getUserTimezone() {
  try {
    console.log('=== GETTING USER TIMEZONE ===');
    
    // Method 1: Intl.DateTimeFormat
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('Method 1 - Intl.DateTimeFormat result:', userTimezone);
      if (userTimezone && userTimezone !== 'UTC') {
        console.log('Service Worker: Using Intl.DateTimeFormat timezone:', userTimezone);
        return userTimezone;
      }
    }
    
    // Method 2: getTimezoneOffset
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    const sign = offset > 0 ? '-' : '+';
    const fallbackTimezone = `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    console.log('Method 2 - getTimezoneOffset result:', fallbackTimezone);
    console.log('Raw offset minutes:', offset);
    
    // Method 3: Manual timezone detection based on offset
    if (offset === -540) { // UTC+9 (Korea, Japan)
      const manualTimezone = 'Asia/Seoul';
      console.log('Method 3 - Manual detection (UTC+9):', manualTimezone);
      return manualTimezone;
    } else if (offset === -300) { // UTC+5 (Eastern US)
      const manualTimezone = 'America/New_York';
      console.log('Method 3 - Manual detection (UTC+5):', manualTimezone);
      return manualTimezone;
    } else if (offset === 0) { // UTC+0 (UK)
      const manualTimezone = 'Europe/London';
      console.log('Method 3 - Manual detection (UTC+0):', manualTimezone);
      return manualTimezone;
    }
    
    console.log('Service Worker: Using fallback timezone:', fallbackTimezone);
    return fallbackTimezone;
    
  } catch (error) {
    console.error('Error getting timezone:', error);
    console.log('Service Worker: Using emergency fallback UTC');
    return 'UTC';
  }
}

function checkCountdownsAndNotify() {
  console.log('Checking countdowns for notifications...');
  
  const settings = getNotificationSettings();
  if (!settings) {
    console.log('No notification settings found');
    return;
  }
  
  const countdowns = getCountdowns();
  if (!countdowns.length) {
    console.log('No countdowns found');
    return;
  }
  
  const now = new Date();
  const userTimezone = getUserTimezone();
  console.log('Current time (user timezone):', now.toLocaleString('en-US', { timeZone: userTimezone }));
  
  // Get current hour and minute in user timezone
  const currentHour = parseInt(now.toLocaleString('en-US', { timeZone: userTimezone, hour: '2-digit', hour12: false }));
  const currentMinute = parseInt(now.toLocaleString('en-US', { timeZone: userTimezone, minute: '2-digit' }));
  const currentTime = `${currentHour}:${currentMinute}`;
  
  console.log(`Current time: ${currentTime}`);
  
  // Only send notifications at 8:00 AM
  if (currentHour !== 8 || currentMinute !== 0) {
    console.log('Not 8:00 AM, skipping countdown notifications');
    return;
  }
  
  countdowns.forEach(countdown => {
    if (!countdown.targetDate) return;
    
    const targetDate = new Date(countdown.targetDate);
    const timeDiff = targetDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    console.log(`Countdown: ${countdown.title}, Days left: ${daysDiff}`);
    
    // Check 1 day before (send at 8:00 AM the day before)
    if (daysDiff === 1 && settings.oneDay) {
      sendCountdownNotification(countdown, 1);
    }
    
    // Check 3 days before (send at 8:00 AM 3 days before)
    if (daysDiff === 3 && settings.threeDays) {
      sendCountdownNotification(countdown, 3);
    }
    
    // Check 7 days before (send at 8:00 AM 7 days before)
    if (daysDiff === 7 && settings.sevenDays) {
      sendCountdownNotification(countdown, 7);
    }
  });
}

function sendCountdownNotification(countdown, daysLeft) {
  const notificationTitle = `${countdown.title} - ${daysLeft} Day${daysLeft > 1 ? 's' : ''} Left`;
  const notificationOptions = {
    body: `Your countdown "${countdown.title}" ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
    icon: '/icons/nowandthen-icon.svg',
    badge: '/icons/nowandthen-icon.svg',
    actions: [
      { action: 'view', title: 'View Timer' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: '/',
      type: 'countdown',
      countdownId: countdown.id,
      daysLeft: daysLeft
    },
    requireInteraction: false,
    vibrate: [200, 100, 200],
    tag: `countdown-${countdown.id}-${daysLeft}`
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
  console.log(`Countdown notification sent: ${countdown.title} - ${daysLeft} days left`);
}

function checkDailySummary() {
  const settings = getNotificationSettings();
  
  if (!settings?.dailySummary) {
    return;
  }
  
  const now = new Date();
  const currentHourNum = now.toLocaleString('en-US', { timeZone: userTimezone, hour: '2-digit', hour12: false });
  const currentMinuteNum = now.toLocaleString('en-US', { timeZone: userTimezone, minute: '2-digit' });
  const currentTime = `${currentHourNum}:${currentMinuteNum}`;
  
  // 시간 비교: ±2분 허용
  const [targetHour, targetMinute] = settings.dailySummaryTime.split(':').map(Number);
  const [currentHourParsed, currentMinuteParsed] = currentTime.split(':').map(Number);
  
  const targetMinutes = targetHour * 60 + targetMinute;
  const currentMinutes = currentHourParsed * 60 + currentMinuteParsed;
  const timeDiff = Math.abs(targetMinutes - currentMinutes);
  
  if (timeDiff <= 2) {
    console.log(`[SW] Daily summary time matched! Sending notification...`);
    sendDailySummaryNotification();
  }
}

function sendDailySummaryNotification() {
  // Service Worker cannot access localStorage, so send a generic notification
  let summaryText = '오늘도 목표를 향해 나아가세요!';
  
  const notificationTitle = '오늘의 타이머 요약';
  const notificationOptions = {
    body: summaryText,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    actions: [
      { action: 'view', title: 'View App' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: '/',
      type: 'daily-summary'
    },
    requireInteraction: true,
    vibrate: [200, 100, 200],
    tag: 'daily-summary'
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
  console.log('Daily summary notification sent');
}

// Background timer state
let timersStarted = false;
let countdownInterval = null;
let dailySummaryInterval = null;

// Start background timers
function startBackgroundTimers() {
  if (timersStarted) {
    return;
  }
  
  console.log('[SW] Starting background timers');
  
  // Check countdowns every hour
  countdownInterval = setInterval(() => {
    checkCountdownsAndNotify();
  }, 60 * 60 * 1000);
  
  // Check daily summary every minute
  let lastCheckMinute = -1;
  dailySummaryInterval = setInterval(() => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    
    if (currentMinute !== lastCheckMinute) {
      lastCheckMinute = currentMinute;
      checkDailySummary();
    }
  }, 60 * 1000);
  
  timersStarted = true;
}

// Start timers when service worker activates
self.addEventListener('activate', (event) => {
  console.log('[SW] Activated - waiting for settings');
});

// Service worker install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installed');
  self.skipWaiting();
});

console.log('[SW] Firebase Service Worker loaded');

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

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url;
    event.waitUntil(clients.openWindow(urlToOpen));
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default click action
    const urlToOpen = event.notification.data.url;
    event.waitUntil(clients.openWindow(urlToOpen));
  }
});

// Store settings and timezone in memory (Service Worker scope)
let currentSettings = null;
let userTimezone = 'UTC'; // Will be updated from main thread
let countdownsData = []; // Store countdown data from main thread

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  const { type, settings, countdowns, payload } = event.data || {};
  
  if (type === 'test-notification') {
    sendTestNotification(event.data.customTime);
  }
  
  if (type === 'schedule-test-notification') {
    const { title, body, delay } = payload;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        actions: [
          { action: 'view', title: 'View App' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        data: { url: '/', type: 'scheduled-test' },
        requireInteraction: true,
        vibrate: [200, 100, 200],
        tag: 'scheduled-test-notification'
      });
    }, delay);
  }
  
  if (type === 'update-settings') {
    if (settings) {
      currentSettings = JSON.parse(JSON.stringify(settings));
    }
    if (event.data.userTimezone) {
      userTimezone = event.data.userTimezone;
    }
    
    console.log(`[SW] Settings: Daily ${currentSettings?.dailySummary ? 'ON' : 'OFF'} at ${currentSettings?.dailySummaryTime}`);
    
    if (!timersStarted) startBackgroundTimers();
  }
  
  if (type === 'update-countdowns') {
    countdownsData = countdowns || [];
    if (countdownsData.length > 0) console.log(`[SW] ${countdownsData.length} countdowns loaded`);
  }
});

// Test notification function
function sendTestNotification(customTime) {
  const notificationTitle = 'Test Notification';
  const notificationOptions = {
    body: `This is a test notification! Custom time: ${customTime}`,
    icon: '/icons/nowandthen-icon.svg',
    badge: '/icons/nowandthen-icon.svg',
    actions: [
      { action: 'view', title: 'View App' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: '/',
      type: 'test',
      customTime: customTime
    },
    requireInteraction: false,
    vibrate: [200, 100, 200],
    tag: 'test-notification'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
  console.log('Test notification sent successfully!');
}

// Force Service Worker update - v5.0 - Complete rewrite to fix const bug
