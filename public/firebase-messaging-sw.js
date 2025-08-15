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
    const settings = localStorage.getItem('nowandthen-notification-settings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
}

function getCountdowns() {
  try {
    const countdowns = localStorage.getItem('nowandthen-countdowns');
    return countdowns ? JSON.parse(countdowns) : [];
  } catch (error) {
    console.error('Error getting countdowns:', error);
    return [];
  }
}

function getUserTimezone() {
  try {
    // Try to get from localStorage first (set by main app)
    const timezone = localStorage.getItem('nowandthen-user-timezone');
    if (timezone) return timezone;
    
    // Fallback to UTC
    return 'UTC';
  } catch (error) {
    console.error('Error getting timezone:', error);
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
  console.log('Checking daily summary...');
  
  const settings = getNotificationSettings();
  if (!settings || !settings.dailySummary) {
    console.log('Daily summary not enabled');
    return;
  }
  
  const userTimezone = getUserTimezone();
  const now = new Date();
  const userTime = now.toLocaleString('en-US', { timeZone: userTimezone });
  const currentHour = now.getLocaleString('en-US', { timeZone: userTimezone, hour: '2-digit', hour12: false });
  const currentMinute = now.getLocaleString('en-US', { timeZone: userTimezone, minute: '2-digit' });
  const currentTime = `${currentHour}:${currentMinute}`;
  
  console.log(`Current time (${userTimezone}): ${currentTime}`);
  console.log(`Daily summary time: ${settings.dailySummaryTime}`);
  
  if (currentTime === settings.dailySummaryTime) {
    sendDailySummaryNotification();
  }
}

function sendDailySummaryNotification() {
  const countdowns = getCountdowns();
  const activeCountdowns = countdowns.filter(c => c.targetDate && new Date(c.targetDate) > new Date());
  
  let summaryText = 'No active countdowns';
  if (activeCountdowns.length > 0) {
    const nearest = activeCountdowns.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))[0];
    const daysLeft = Math.ceil((new Date(nearest.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    summaryText = `${activeCountdowns.length} active countdowns. Nearest: "${nearest.title}" in ${daysLeft} days`;
  }
  
  const notificationTitle = 'Daily Countdown Summary';
  const notificationOptions = {
    body: summaryText,
    icon: '/icons/nowandthen-icon.svg',
    badge: '/icons/nowandthen-icon.svg',
    actions: [
      { action: 'view', title: 'View App' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: '/',
      type: 'daily-summary'
    },
    requireInteraction: false,
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
  console.log('Service Worker activated, starting timers...');
  event.waitUntil(startBackgroundTimers());
});

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

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'test-notification') {
    console.log('Sending test notification...');
    sendTestNotification(event.data.customTime);
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