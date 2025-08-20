import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase 설정 확인
const hasFirebaseConfig = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

const firebaseConfig = hasFirebaseConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
} : null;

// Firebase 설정이 완전할 때만 초기화
const app = (hasFirebaseConfig && firebaseConfig) ? initializeApp(firebaseConfig) : null;

export const messaging = (() => {
  try {
    return (typeof window !== 'undefined' && app && hasFirebaseConfig) ? getMessaging(app) : null;
  } catch (error) {
    console.error('Firebase messaging initialization failed:', error);
    return null;
  }
})();

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !messaging || !hasFirebaseConfig) {
    process.env.NODE_ENV === 'development' && console.log('Firebase not configured, skipping notification setup');
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // 통합 서비스 워커 사용
      if ('serviceWorker' in navigator) {
        try {
          // 통합 서비스 워커가 준비될 때까지 대기
          const registration = await navigator.serviceWorker.ready;
          
          // Firebase 메시징 설정
          if (registration.active) {
            registration.active.postMessage({
              type: 'firebase-ready',
              timestamp: Date.now()
            });
          }
          
          process.env.NODE_ENV === 'development' && console.log('[Firebase] Using unified service worker');
        } catch (swError) {
          console.warn('[Firebase] Service worker not ready:', swError);
          // 서비스 워커 실패해도 계속 진행
        }
      }
      
      // 토큰 요청 (통합 서비스 워커 사용)
      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.ready
        });
        
        if (!token) {
          console.warn('[Firebase] No FCM token received');
        }
        
        return token;
      } catch (tokenError) {
        console.error('[Firebase] Token request failed:', tokenError);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting notification token:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });