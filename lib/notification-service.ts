/**
 * 통합 알림 서비스 - Firebase FCM + 순수 웹 푸시 지원
 * Firebase가 실패하면 순수 웹 푸시로 fallback
 */

import { supabase } from './supabase';
import { webPushManager, type PushSubscription as WebPushSubscription } from './webpush';

export interface NotificationSettings {
  enabled?: boolean;
  oneDay: boolean;
  threeDays: boolean;
  sevenDays: boolean;
  dailySummary: boolean;
  dailySummaryTime: string;
}

export interface CountdownData {
  id: string;
  title: string;
  targetDate: string;
  isVisible: boolean;
}

export type NotificationMethod = 'firebase' | 'webpush' | 'none';

export class NotificationService {
  private currentMethod: NotificationMethod = 'none';
  private firebaseToken: string | null = null;
  private webpushSubscription: WebPushSubscription | null = null;
  
  constructor() {
    this.detectBestMethod();
  }

  /**
   * Detect the best notification method available
   */
  private async detectBestMethod(): Promise<NotificationMethod> {
    process.env.NODE_ENV === 'development' && console.log('[Notifications] 🔍 Starting method detection...');
    
    // Try web push first (more stable)
    try {
      process.env.NODE_ENV === 'development' && console.log('[Notifications] 🔍 Checking Web Push support...');
      if (webPushManager.isSupported()) {
        process.env.NODE_ENV === 'development' && console.log('[Notifications] ✅ Web Push is supported');
        const permission = await webPushManager.requestPermission();
        process.env.NODE_ENV === 'development' && console.log('[Notifications] 🔍 Permission result:', permission);
        
        if (permission === 'granted') {
          process.env.NODE_ENV === 'development' && console.log('[Notifications] 🔍 Creating Web Push subscription...');
          const subscription = await webPushManager.subscribe();
          process.env.NODE_ENV === 'development' && console.log('[Notifications] 🔍 Subscription result:', !!subscription);
          
          if (subscription) {
            this.currentMethod = 'webpush';
            this.webpushSubscription = subscription;
            process.env.NODE_ENV === 'development' && console.log('[Notifications] ✅ Web Push enabled successfully');
            process.env.NODE_ENV === 'development' && console.log('[Notifications] Subscription endpoint:', subscription.endpoint);
            return 'webpush';
          } else {
            process.env.NODE_ENV === 'development' && console.log('[Notifications] ❌ Web Push subscription failed');
          }
        } else {
          process.env.NODE_ENV === 'development' && console.log('[Notifications] ❌ Web Push permission denied');
        }
      } else {
        process.env.NODE_ENV === 'development' && console.log('[Notifications] ❌ Web Push not supported');
      }
    } catch (error) {
      console.error('[Notifications] ❌ Web Push error:', error);
      process.env.NODE_ENV === 'development' && console.log('[Notifications] 🔄 Trying Firebase...');
    }

    // Firebase는 현재 문제가 있어서 Web Push만 사용
    process.env.NODE_ENV === 'development' && console.log('[Notifications] Skipping Firebase, using Web Push only');

    console.warn('[Notifications] No notification method available');
    this.currentMethod = 'none';
    return 'none';
  }

  /**
   * 알림 권한 요청 및 구독 설정
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // 최적의 방법으로 구독 설정
      const method = await this.detectBestMethod();
      return method !== 'none';
      
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * 사용자 구독 정보를 데이터베이스에 저장
   */
  async saveSubscription(userId: string, settings: NotificationSettings): Promise<boolean> {
    if (this.currentMethod === 'none') {
      console.warn('No notification method available for saving subscription');
      return false;
    }

    try {
      // 기존 스키마에 맞게 데이터 구조 조정
      const subscriptionData: any = {
        user_id: userId,
        notification_preferences: {
          ...settings,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        updated_at: new Date().toISOString()
      };

      // Firebase 토큰이 있으면 추가
      if (this.firebaseToken) {
        subscriptionData.fcm_token = this.firebaseToken;
      }

      // 웹 푸시 구독이 있으면 push_subscription에 저장 (기존 컬럼 활용)
      if (this.webpushSubscription) {
        subscriptionData.push_subscription = this.webpushSubscription;
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving subscription:', error);
        return false;
      }

      process.env.NODE_ENV === 'development' && console.log('[Notifications] Subscription saved');

      // Immediately ensure preferences for daily summary are present and normalized
      try {
        const dailyPrefs = {
          enabled: true,
          dailySummary: true,
          dailySummaryTime: settings.dailySummaryTime || '08:30',
          daily_summary: true,
          daily_summary_time: (settings.dailySummaryTime || '08:30'),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        } as any;

        await supabase
          .from('push_subscriptions')
          .update({ notification_preferences: { ...settings, ...dailyPrefs } })
          .eq('user_id', userId);
      } catch (e) {
        console.warn('[Notifications] Normalization update failed (non-fatal):', e);
      }

      // Optionally ping backend to (re)schedule daily reminders for this user
      try {
        fetch('/api/force-daily-summary', { method: 'POST' }).catch(() => {});
      } catch {}
      return true;

    } catch (error) {
      console.error('Error saving subscription:', error);
      return false;
    }
  }

  /**
   * 서비스 워커에 설정 업데이트 전송
   */
  async updateServiceWorkerSettings(settings: NotificationSettings, countdowns: CountdownData[]): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // 통합 서비스 워커에 설정 전송
      if (registration.active) {
        registration.active.postMessage({
          type: 'update-settings',
          settings: settings,
          userTimezone: userTimezone
        });

        // 카운트다운 데이터도 전송
        registration.active.postMessage({
          type: 'update-countdowns',
          countdowns: countdowns
        });
      }

      process.env.NODE_ENV === 'development' && console.log('[Notifications] Settings synced to unified service worker');

    } catch (error) {
      console.error('Error updating Service Worker settings:', error);
    }
  }

  /**
   * 테스트 알림 전송
   */
  async sendTestNotification(title: string, body: string): Promise<boolean> {
    try {
      if (this.currentMethod === 'firebase') {
        // Firebase는 서버를 통해 전송해야 함
        process.env.NODE_ENV === 'development' && console.log('[NotificationService] Firebase test notification requires server');
        return false;
      } else if (this.currentMethod === 'webpush') {
        // 순수 웹 푸시는 즉시 전송 가능
        await webPushManager.sendTestNotification(title, body);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  /**
   * 구독 해제
   */
  async unsubscribe(): Promise<boolean> {
    try {
      let success = true;

      // Firebase 구독 해제
      if (this.firebaseToken) {
        // Firebase는 서버에서 토큰 무효화 필요
        this.firebaseToken = null;
      }

      // 웹 푸시 구독 해제
      if (this.webpushSubscription) {
        const unsubscribed = await webPushManager.unsubscribe();
        success = success && unsubscribed;
        this.webpushSubscription = null;
      }

      this.currentMethod = 'none';
      return success;

    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }

  /**
   * 현재 사용 중인 알림 방법 반환
   */
  getCurrentMethod(): NotificationMethod {
    return this.currentMethod;
  }

  /**
   * 현재 푸시 구독 반환
   */
  getCurrentSubscription(): WebPushSubscription | null {
    return this.webpushSubscription;
  }

  /**
   * 알림 지원 여부 확인
   */
  isSupported(): boolean {
    return this.currentMethod !== 'none';
  }
}

// 싱글톤 인스턴스
export const notificationService = new NotificationService();