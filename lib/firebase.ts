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
    console.log('Firebase not configured, skipping notification setup');
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Service Worker 등록 및 준비 대기
      if ('serviceWorker' in navigator) {
        try {
          // 기존 서비스 워커 언레지스터
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
          
          // 새로운 서비스 워커 등록
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js?v=' + Date.now());
          
          // 서비스 워커가 활성화될 때까지 대기
          await navigator.serviceWorker.ready;
          
          // 추가 대기 시간 (서비스 워커 완전 초기화)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('[Firebase] Service Worker ready');
        } catch (swError) {
          console.warn('[Firebase] SW registration failed:', swError);
          // 서비스 워커 실패해도 계속 진행
        }
      }
      
      // 토큰 요청 (서비스 워커 준비 후)
      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
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