// 자동화된 알림 테스트 스크립트
console.log('🧪 Starting automated notification test...');

// 1. 브라우저 지원 확인
console.log('🔍 Browser Support Check:');
console.log('- Service Worker:', 'serviceWorker' in navigator);
console.log('- Push Manager:', 'PushManager' in window);
console.log('- Notification:', 'Notification' in window);
console.log('- PWA Mode:', window.matchMedia('(display-mode: standalone)').matches);

// 2. 알림 권한 상태 확인
console.log('🔍 Notification Permission Check:');
console.log('- Current permission:', Notification.permission);

// 3. 서비스 워커 상태 확인
async function checkServiceWorker() {
  try {
    console.log('🔍 Service Worker Check:');
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      console.log('- Has registration:', !!registration);
      
      if (registration) {
        console.log('- Service Worker state:', registration.active ? 'active' : 'inactive');
        console.log('- Has push manager:', !!registration.pushManager);
        
        // 기존 구독 확인
        const subscription = await registration.pushManager.getSubscription();
        console.log('- Has existing subscription:', !!subscription);
        
        if (subscription) {
          console.log('- Subscription endpoint:', subscription.endpoint.substring(0, 50) + '...');
          console.log('- Has keys:', !!subscription.keys);
        }
      }
    }
  } catch (error) {
    console.error('❌ Service Worker check failed:', error);
  }
}

// 4. VAPID 키 확인
function checkVAPIDKeys() {
  console.log('🔍 VAPID Keys Check:');
  
  // 환경변수에서 VAPID 키 확인 (브라우저에서는 process.env가 없음)
  console.log('- NEXT_PUBLIC_VAPID_PUBLIC_KEY available:', typeof process !== 'undefined' && !!process.env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
  
  // 실제로는 window 객체에서 확인해야 함
  if (typeof window !== 'undefined') {
    console.log('- Window object available:', true);
    console.log('- Document ready state:', document.readyState);
  }
}

// 5. 알림 테스트
async function testNotification() {
  try {
    console.log('🔍 Notification Test:');
    
    // 즉시 알림 테스트
    if (Notification.permission === 'granted') {
      console.log('✅ Permission granted, testing immediate notification...');
      
      const notification = new Notification('테스트 알림', {
        body: '즉시 알림 테스트입니다!',
        icon: '/favicon.ico',
        tag: 'test-immediate'
      });
      
      console.log('✅ Immediate notification created:', !!notification);
      
      // 3초 후 자동으로 닫기
      setTimeout(() => {
        notification.close();
        console.log('✅ Test notification closed');
      }, 3000);
      
    } else {
      console.log('❌ Permission not granted, cannot test notification');
    }
  } catch (error) {
    console.error('❌ Notification test failed:', error);
  }
}

// 6. 푸시 구독 테스트
async function testPushSubscription() {
  try {
    console.log('🔍 Push Subscription Test:');
    
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      console.log('- Service Worker ready:', !!registration);
      
      // 기존 구독 확인
      let subscription = await registration.pushManager.getSubscription();
      console.log('- Existing subscription:', !!subscription);
      
      if (!subscription) {
        console.log('🔍 Creating new subscription...');
        
        // VAPID 키가 필요하지만 브라우저에서는 직접 접근 불가
        console.log('⚠️ VAPID key needed for subscription (check server logs)');
      } else {
        console.log('✅ Subscription found:', subscription.endpoint.substring(0, 50) + '...');
      }
    }
  } catch (error) {
    console.error('❌ Push subscription test failed:', error);
  }
}

// 7. 메인 테스트 실행
async function runAllTests() {
  console.log('\n🚀 Running all notification tests...\n');
  
  checkVAPIDKeys();
  await checkServiceWorker();
  await testNotification();
  await testPushSubscription();
  
  console.log('\n✅ All tests completed!');
  console.log('📋 Check the logs above for any issues');
}

// 페이지 로드 완료 후 테스트 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}

// 전역 함수로 노출 (브라우저 콘솔에서 직접 호출 가능)
window.testNotifications = runAllTests;
console.log('🧪 Test function available: testNotifications()');
