// 자동화된 PWA 알림 디버깅 스크립트
console.log('🔍 Starting automated PWA notification debugging...');

// 1. 파일 존재성 체크
async function checkFileExistence() {
  console.log('\n📁 File Existence Check:');
  
  const criticalFiles = [
    '/sw-unified.js',
    '/firebase-messaging-sw.js',
    '/sw-webpush.js'
  ];
  
  for (const file of criticalFiles) {
    try {
      const response = await fetch(file);
      if (response.ok) {
        console.log(`✅ ${file} - exists (${response.status})`);
      } else {
        console.log(`❌ ${file} - missing (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${file} - error: ${error.message}`);
    }
  }
}

// 2. 서비스 워커 등록 상태 체크
async function checkServiceWorkerStatus() {
  console.log('\n🔧 Service Worker Status Check:');
  
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`- Total registrations: ${registrations.length}`);
      
      for (let i = 0; i < registrations.length; i++) {
        const reg = registrations[i];
        console.log(`- Registration ${i + 1}:`);
        console.log(`  - Script URL: ${reg.scope}`);
        console.log(`  - Active: ${!!reg.active}`);
        console.log(`  - Waiting: ${!!reg.waiting}`);
        console.log(`  - Installing: ${!!reg.installing}`);
        
        if (reg.active) {
          console.log(`  - Active script: ${reg.active.scriptURL}`);
        }
      }
      
      // 통합 서비스 워커 확인
      const unifiedSW = registrations.find(reg => 
        reg.active && reg.active.scriptURL.includes('sw-unified.js')
      );
      
      if (unifiedSW) {
        console.log('✅ Unified service worker found and active');
      } else {
        console.log('❌ Unified service worker not found or inactive');
      }
      
    } catch (error) {
      console.error('❌ Service worker check failed:', error);
    }
  } else {
    console.log('❌ Service Worker not supported');
  }
}

// 3. VAPID 키 상태 체크
function checkVAPIDKeys() {
  console.log('\n🔑 VAPID Keys Check:');
  
  // 환경변수 체크 (서버 사이드)
  if (typeof process !== 'undefined' && process.env) {
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    
    console.log(`- NEXT_PUBLIC_VAPID_PUBLIC_KEY: ${vapidPublic ? '✅ Set' : '❌ Missing'}`);
    console.log(`- VAPID_PRIVATE_KEY: ${vapidPrivate ? '✅ Set' : '❌ Missing'}`);
    
    if (vapidPublic) {
      console.log(`  - Length: ${vapidPublic.length} characters`);
      console.log(`  - Format: ${vapidPublic.startsWith('B') ? '✅ Valid' : '❌ Invalid format'}`);
    }
  } else {
    console.log('- Environment variables not accessible in browser');
  }
  
  // 브라우저에서 접근 가능한 VAPID 키 체크
  if (typeof window !== 'undefined') {
    const windowVapid = window.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    console.log(`- Window VAPID key: ${windowVapid ? '✅ Available' : '❌ Missing'}`);
    
    if (windowVapid) {
      console.log(`  - Length: ${windowVapid.length} characters`);
    }
  }
}

// 4. Firebase 설정 체크
function checkFirebaseConfig() {
  console.log('\n🔥 Firebase Configuration Check:');
  
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_VAPID_KEY'
  ];
  
  let allSet = true;
  
  for (const key of requiredKeys) {
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[key];
      if (value) {
        console.log(`✅ ${key}: Set`);
      } else {
        console.log(`❌ ${key}: Missing`);
        allSet = false;
      }
    }
  }
  
  if (allSet) {
    console.log('✅ All Firebase keys are configured');
  } else {
    console.log('❌ Some Firebase keys are missing');
  }
}

// 5. 브라우저 지원 체크
function checkBrowserSupport() {
  console.log('\n🌐 Browser Support Check:');
  
  const features = {
    'Service Worker': 'serviceWorker' in navigator,
    'Push Manager': 'PushManager' in window,
    'Notification': 'Notification' in window,
    'Fetch API': 'fetch' in window,
    'Promise': 'Promise' in window
  };
  
  for (const [feature, supported] of Object.entries(features)) {
    console.log(`- ${feature}: ${supported ? '✅ Supported' : '❌ Not supported'}`);
  }
  
  // PWA 모드 체크
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  console.log(`- PWA Mode: ${isPWA ? '✅ Active' : '❌ Not active'}`);
  
  // 모바일 체크
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log(`- Mobile Device: ${isMobile ? '✅ Yes' : '❌ No'}`);
}

// 6. 알림 권한 체크
function checkNotificationPermission() {
  console.log('\n🔔 Notification Permission Check:');
  
  if ('Notification' in window) {
    const permission = Notification.permission;
    console.log(`- Current permission: ${permission}`);
    
    switch (permission) {
      case 'granted':
        console.log('✅ Notifications are allowed');
        break;
      case 'denied':
        console.log('❌ Notifications are blocked');
        break;
      case 'default':
        console.log('⚠️ Permission not yet requested');
        break;
    }
  } else {
    console.log('❌ Notifications not supported');
  }
}

// 7. 푸시 구독 상태 체크
async function checkPushSubscription() {
  console.log('\n📱 Push Subscription Check:');
  
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('✅ Push subscription found:');
        console.log(`  - Endpoint: ${subscription.endpoint.substring(0, 50)}...`);
        console.log(`  - Has keys: ${!!subscription.keys}`);
        
        if (subscription.keys) {
          const p256dh = subscription.getKey('p256dh');
          const auth = subscription.getKey('auth');
          console.log(`  - p256dh key: ${p256dh ? '✅ Present' : '❌ Missing'}`);
          console.log(`  - auth key: ${auth ? '✅ Present' : '❌ Missing'}`);
        }
      } else {
        console.log('❌ No push subscription found');
      }
    } catch (error) {
      console.error('❌ Push subscription check failed:', error);
    }
  } else {
    console.log('❌ Push Manager not supported');
  }
}

// 8. API 엔드포인트 체크
async function checkAPIEndpoints() {
  console.log('\n🌐 API Endpoints Check:');
  
  const endpoints = [
    '/api/send-push',
    '/api/test-push-delayed'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'OPTIONS' });
      if (response.ok) {
        console.log(`✅ ${endpoint} - accessible`);
      } else {
        console.log(`❌ ${endpoint} - error (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - network error: ${error.message}`);
    }
  }
}

// 9. 문제점 분석 및 해결책 제시
function analyzeIssues() {
  console.log('\n🔍 Issue Analysis & Solutions:');
  
  // 여기서 발견된 문제점들을 분석하고 해결책 제시
  console.log('📋 Common issues to check:');
  console.log('1. VAPID keys not accessible in browser');
  console.log('2. Service worker not properly registered');
  console.log('3. Firebase configuration conflicts');
  console.log('4. Missing API endpoints');
  console.log('5. Browser compatibility issues');
}

// 10. 메인 실행 함수
async function runAllChecks() {
  console.log('🚀 Running comprehensive PWA notification diagnostics...\n');
  
  await checkFileExistence();
  await checkServiceWorkerStatus();
  checkVAPIDKeys();
  checkFirebaseConfig();
  checkBrowserSupport();
  checkNotificationPermission();
  await checkPushSubscription();
  await checkAPIEndpoints();
  analyzeIssues();
  
  console.log('\n✅ All diagnostic checks completed!');
  console.log('📋 Review the logs above for any issues');
}

// 페이지 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllChecks);
} else {
  runAllChecks();
}

// 전역 함수로 노출
window.runPWADiagnostics = runAllChecks;
console.log('🧪 Diagnostic function available: runPWADiagnostics()');
