/**
 * Pure Web Push API implementation as fallback to Firebase
 * Based on web standards without external dependencies
 */

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
    // VAPID 키는 환경변수에서 가져오기
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    
    if (!this.vapidPublicKey) {
      console.warn('VAPID public key not found. Web push may not work.');
    }
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
      // 모바일에서 강화된 서비스 워커 등록
      console.log('[WebPush] Registering service worker for background notifications...');
      
      const registration = await navigator.serviceWorker.register('/sw-webpush.js', {
        scope: '/'  // 전체 도메인에서 작동하도록
      });
      
      console.log('[WebPush] Service Worker registered:', registration);
      
      // 등록 완료까지 대기
      await navigator.serviceWorker.ready;
      console.log('[WebPush] Service Worker ready for background notifications');
      
      // 모바일에서 서비스 워커가 백그라운드에서 계속 작동하도록 keepalive 설정
      if (registration.active) {
        // 주기적으로 서비스 워커에게 keepalive 신호 전송
        setInterval(() => {
          if (registration.active) {
            registration.active.postMessage({ type: 'KEEP_SW_ALIVE' });
          }
        }, 25000); // 25초마다
      }
      
      return registration;
    } catch (error) {
      console.error('[WebPush] Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Push 구독 생성
   */
  async subscribe(): Promise<PushSubscription | null> {
    try {
      const registration = await this.registerServiceWorker();
      
      // 기존 구독이 있는지 확인
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // 새로운 구독 생성
        const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
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