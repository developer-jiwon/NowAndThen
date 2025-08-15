// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

// Timer-based notification functions
function getNotificationSettings() {
  try {
    console.log('Getting notification settings from Service Worker memory...');
    console.log('Current settings in memory:', currentSettings);
    
    if (!currentSettings) {
      console.log('No settings in memory, returning null');
      return null;
    }
    
    return currentSettings;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
}

function getCountdowns() {
  // Service Worker cannot access localStorage directly
  // Return empty array or use data passed from main thread
  console.log('Service Worker: Cannot access localStorage, returning empty countdowns');
  return [];
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
  console.log('=== DAILY SUMMARY CHECK ===');
  console.log('Checking daily summary...');
  
  const settings = getNotificationSettings();
  console.log('Notification settings:', settings);
  
  if (!settings) {
    console.log('No notification settings found');
    return;
  }
  
  if (!settings.dailySummary) {
    console.log('Daily summary not enabled in settings');
    return;
  }
  
  // Use the stored userTimezone variable instead of calling getUserTimezone()
  const now = new Date();
  const userTime = now.toLocaleString('en-US', { timeZone: userTimezone });
  const currentHour = now.toLocaleString('en-US', { timeZone: userTimezone, hour: '2-digit', hour12: false });
  const currentMinute = now.toLocaleString('en-US', { timeZone: userTimezone, minute: '2-digit' });
  const currentTime = `${currentHour}:${currentMinute}`;
  
  console.log(`Service Worker: Using timezone from variable: ${userTimezone}`);
  console.log(`Current time (${userTimezone}): ${currentTime}`);
  console.log(`Daily summary time setting: ${settings.dailySummaryTime}`);
  
  // 시간 비교: ±2분 허용
  const [targetHour, targetMinute] = settings.dailySummaryTime.split(':').map(Number);
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  
  const targetMinutes = targetHour * 60 + targetMinute;
  const currentMinutes = currentHour * 60 + currentMinute;
  const timeDiff = Math.abs(targetMinutes - currentMinutes);
  
  console.log(`Time difference: ${timeDiff} minutes`);
  console.log(`Time match: ${timeDiff <= 2}`);
  
  if (timeDiff <= 2) {
    console.log('Time matched! Sending daily summary notification...');
    sendDailySummaryNotification();
  } else {
    console.log('Time not matched yet');
  }
}

function sendDailySummaryNotification() {
  // Service Worker cannot access localStorage, so send a generic notification
  let summaryText = '오늘도 목표를 향해 나아가세요! 💪';
  
  const notificationTitle = '📅 오늘의 타이머 요약';
  const notificationOptions = {
    body: summaryText,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
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

// Start background timers
function startBackgroundTimers() {
  console.log('Starting background timers...');
  
  // Check countdowns every hour
  setInterval(() => {
    checkCountdownsAndNotify();
  }, 60 * 60 * 1000); // 1 hour
  
  // Check daily summary every minute
  setInterval(() => {
    checkDailySummary();
  }, 60 * 1000); // 1 minute
  
  console.log('Background timers started');
}

// Start timers when service worker activates
self.addEventListener('activate', (event) => {
  console.log('=== SERVICE WORKER ACTIVATED ===');
  console.log('Service Worker activated, starting timers...');
  event.waitUntil(startBackgroundTimers());
});

// Also start timers when service worker installs
self.addEventListener('install', (event) => {
  console.log('=== SERVICE WORKER INSTALLED ===');
  console.log('Service Worker installed');
});

// Don't start timers immediately - wait for settings
console.log('=== FIREBASE SERVICE WORKER LOADED ===');
console.log('Waiting for settings before starting timers...');

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
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

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  console.log('=== SERVICE WORKER MESSAGE RECEIVED ===');
  console.log('Message type:', event.data?.type);
  console.log('Message data:', event.data);
  console.log('Source:', event.source);
  console.log('Current settings before update:', currentSettings);
  console.log('Current timezone before update:', userTimezone);
  
  if (event.data && event.data.type === 'test-notification') {
    console.log('Sending test notification...');
    sendTestNotification(event.data.customTime);
  }
  
  if (event.data && event.data.type === 'update-settings') {
    console.log('=== UPDATING SERVICE WORKER SETTINGS ===');
    console.log('Old settings:', currentSettings);
    console.log('Old timezone:', userTimezone);
    
    // Store new settings
    currentSettings = event.data.settings;
    console.log('Settings stored in memory:', currentSettings);
    
    // Update timezone if provided
    if (event.data.userTimezone) {
      userTimezone = event.data.userTimezone;
      console.log('User timezone updated to:', userTimezone);
    }
    
    console.log('Final settings in memory:', currentSettings);
    console.log('Final timezone in memory:', userTimezone);
    console.log('Settings updated in Service Worker successfully!');
    
    // Verify storage
    console.log('=== VERIFICATION ===');
    console.log('currentSettings === event.data.settings:', currentSettings === event.data.settings);
    console.log('currentSettings.dailySummaryTime:', currentSettings?.dailySummaryTime);
    console.log('event.data.settings.dailySummaryTime:', event.data.settings?.dailySummaryTime);
    
    // Show detailed timezone and time info using received timezone
    const now = new Date();
    const currentTime = now.toLocaleString('en-US', { timeZone: userTimezone });
    const currentHour = now.toLocaleString('en-US', { timeZone: userTimezone, hour: '2-digit', hour12: false });
    const currentMinute = now.toLocaleString('en-US', { timeZone: userTimezone, minute: '2-digit' });
    const currentTimeFormatted = `${currentHour}:${currentMinute}`;
    
    console.log('=== SERVICE WORKER TIMEZONE & TIME INFO ===');
    console.log('Service Worker using timezone:', userTimezone);
    console.log('Current time in Service Worker:', currentTime);
    console.log('Current time (HH:MM):', currentTimeFormatted);
    console.log('Daily summary time setting:', currentSettings.dailySummaryTime);
    console.log('Time until next check:', `${currentSettings.dailySummaryTime} - ${currentTimeFormatted}`);
    
    // Start timers after receiving settings
    console.log('Starting background timers now...');
    startBackgroundTimers();
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
}// Force Service Worker update - Fri Aug 15 17:24:24 EDT 2025
