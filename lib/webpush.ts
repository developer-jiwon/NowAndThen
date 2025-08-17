/**
 * Pure Web Push API implementation as fallback to Firebase
 * Based on web standards without external dependencies
 */

// Window 객체에 타입 추가
declare global {
  interface Window {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string;
    webPushManager?: WebPushManager;
  }
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class WebPushManager {
  private vapidPublicKey: string;
  
  constructor() {
    // 생성자에서 바로 VAPID 키 설정 시도
    if (typeof window !== 'undefined' && window.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      this.vapidPublicKey = window.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log('[WebPush] VAPID key set in constructor:', this.vapidPublicKey.substring(0, 20) + '...');
    } else {
      this.vapidPublicKey = '';
      console.log('[WebPush] VAPID key not available in constructor, will set later');
    }
  }
  
  // VAPID 키 설정 메서드
  setVapidKey(key: string) {
    this.vapidPublicKey = key;
    console.log('[WebPush] VAPID key set:', key.substring(0, 20) + '...');
  }
  
  // VAPID 키 가져오기
  getVapidKey(): string {
    if (!this.vapidPublicKey) {
      // 브라우저에서 window 객체에서 가져오기
      if (typeof window !== 'undefined' && window.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        this.vapidPublicKey = window.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        console.log('[WebPush] VAPID key loaded from window:', this.vapidPublicKey.substring(0, 20) + '...');
      }
    }
    
    // VAPID 키가 여전히 없으면 하드코딩된 키 사용 (임시 해결책)
    if (!this.vapidPublicKey) {
      console.warn('[WebPush] VAPID public key not found, using hardcoded key as fallback');
      this.vapidPublicKey = 'BPkvztDqKmqVqzYmBJTbGpATHDHXKBTukcbOGUd_z4dzaHSd2icshWEaEtUke2RphUjEQql2s5lhLTNxQlLsnXk';
    }
    
    return this.vapidPublicKey;
  }

  /**
   * 브라우저 웹 푸시 지원 여부 확인
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Web push is not supported in this browser');
    }

    // 모바일 브라우저 감지
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    console.log('[WebPush] Device check - Mobile:', isMobile, 'iOS:', isIOS);
    
    // iOS Safari는 PWA에서만 웹푸시 지원
    if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[WebPush] iOS detected - PWA mode required for notifications');
      throw new Error('iOS requires PWA mode for notifications');
    }

    // 현재 권한 상태 확인
    const currentPermission = Notification.permission;
    console.log('[WebPush] Current permission:', currentPermission);
    
    if (currentPermission === 'granted') {
      return 'granted';
    }
    
    if (currentPermission === 'denied') {
      throw new Error('Notifications are blocked. Please enable them in browser settings.');
    }

    // 권한 요청
    let permission: NotificationPermission;
    
    try {
      // 구형 브라우저 호환성
      if ('requestPermission' in Notification) {
        permission = await Notification.requestPermission();
      } else {
        // Legacy callback API
        permission = await new Promise((resolve) => {
          Notification.requestPermission((result) => {
            resolve(result as NotificationPermission);
          });
        });
      }
      
      console.log('[WebPush] Permission result:', permission);
      return permission;
      
    } catch (error) {
      console.error('[WebPush] Permission request failed:', error);
      throw error;
    }
  }

  /**
   * 서비스 워커 등록
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker is not supported');
    }

    try {
      // 통합 서비스 워커 사용
      console.log('[WebPush] Using unified service worker for background notifications...');
      
      const registration = await navigator.serviceWorker.ready;
      console.log('[WebPush] Unified Service Worker ready for background notifications');
      
      return registration;
    } catch (error) {
      console.error('[WebPush] Service Worker not ready:', error);
      throw error;
    }
  }

  /**
   * Push 구독 생성
   */
  async subscribe(): Promise<PushSubscription | null> {
    try {
      console.log('[WebPush] 🔍 Starting push subscription process...');
      console.log('[WebPush] VAPID public key available:', !!this.vapidPublicKey);
      console.log('[WebPush] VAPID key length:', this.vapidPublicKey.length);
      
      const registration = await this.registerServiceWorker();
      
      // 기존 구독이 있는지 확인
      console.log('[WebPush] 🔍 Checking existing subscription...');
      let subscription = await registration.pushManager.getSubscription();
      console.log('[WebPush] Existing subscription:', !!subscription);
      
      if (!subscription) {
        console.log('[WebPush] 🔍 Creating new push subscription...');
        // 새로운 구독 생성
        const vapidKey = this.getVapidKey();
        if (!vapidKey) {
          throw new Error('VAPID key not available');
        }
        
        const applicationServerKey = this.urlBase64ToUint8Array(vapidKey);
        console.log('[WebPush] Application server key created:', !!applicationServerKey);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
        console.log('[WebPush] New subscription result:', !!subscription);
      }

      if (!subscription) {
        console.error('Failed to create push subscription');
        return null;
      }

      // PushSubscription을 우리 형식으로 변환
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      if (!p256dh || !auth) {
        console.error('Failed to get subscription keys');
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(p256dh),
          auth: this.arrayBufferToBase64(auth)
        }
      };
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  /**
   * Push 구독 해제
   */
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return true;

      return await subscription.unsubscribe();
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * 테스트 알림 전송 (로컬에서만)
   */
  async sendTestNotification(title: string, body: string, data?: any): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker is not supported');
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error('Service Worker is not registered');
    }

    // 서비스 워커에 직접 메시지 전송
    if (registration.active) {
      registration.active.postMessage({
        type: 'show-notification',
        payload: {
          title,
          body,
          data,
          options: {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'test-notification',
            requireInteraction: true,
            actions: [
              { action: 'view', title: '보기' },
              { action: 'dismiss', title: '닫기' }
            ]
          }
        }
      });
    }
  }

  /**
   * VAPID 공개 키를 Uint8Array로 변환
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * ArrayBuffer를 Base64로 변환
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// 싱글톤 인스턴스
export const webPushManager = new WebPushManager();

// 브라우저에서 전역으로 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.webPushManager = webPushManager;
}