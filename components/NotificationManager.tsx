"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, Settings } from 'lucide-react'
import { requestNotificationPermission, onMessageListener, messaging } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import NotificationPreferences from '@/components/NotificationPreferences'

export default function NotificationManager() {
  const user = useUser();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(mobile);
    };
    
    checkMobile();
  }, []);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.warn('NotificationManager error caught:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // If there was an error or on mobile, don't render the component
  if (hasError || isMobile) {
    return null;
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission()
          setPermission(permission)
          
          if (permission === 'granted') {
            checkSubscriptionStatus()
          }
        }
      } catch (error) {
        console.warn('Notification permission check failed:', error)
        setPermission('denied')
      }
    }

    checkPermission()
  }, [user])

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener()
      .then((payload: any) => {
        console.log('Foreground message received:', payload)
        toast.success(payload.notification?.title || 'Timer Alert', {
          description: payload.notification?.body,
        })
      })
      .catch((err) => console.log('Failed to receive foreground message:', err))
    
    return () => {
      // Cleanup if needed
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle() // Use maybeSingle instead of single to handle no rows
      
      if (error) {
        // Log error but don't throw - this prevents 406 errors from breaking the app
        console.warn('Push subscription check failed:', error.message)
        setIsSubscribed(false)
        return
      }
      
      setIsSubscribed(!!data)
    } catch (error) {
      console.warn('Push subscription check error:', error)
      setIsSubscribed(false)
    }
  }

  const subscribeToPush = async () => {
    if (!user) {
      toast.error('Please sign in first')
      return
    }

    // 알림 활성화 시 바로 설정 창 열기
    setShowPreferences(true)
  }

  const actuallySubscribeToPush = async () => {
    if (!user) return

    // Check if service worker and push manager are available
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications not supported in this browser')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      // Request notification permission and get FCM token
      const token = await requestNotificationPermission()
      
      if (!token) {
        toast.error('Failed to get notification permission')
        setIsLoading(false)
        return
      }

      // Also register with Push API for additional browser support
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY
      })

      // Save both FCM token and Push subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          fcm_token: token,
          push_subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      setIsSubscribed(true)
      setPermission('granted')
      toast.success('Notifications enabled! You\'ll receive alerts for upcoming timers.')
      
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('Failed to enable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    if (!user) return

    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setIsSubscribed(false)
      toast.success('Notifications disabled')
      
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      toast.error('Failed to disable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  // Firebase가 설정되지 않은 경우 비활성화된 버튼 표시
  if (!messaging) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled
          className="h-8 text-xs opacity-50"
          title="Firebase 설정이 필요합니다"
        >
          <Bell className="w-3 h-3 mr-1" />
          Setup Required
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {permission === 'denied' ? (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <BellOff className="w-3 h-3" />
            <span>Notifications blocked</span>
          </div>
        ) : isSubscribed ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={unsubscribeFromPush}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              <BellOff className="w-3 h-3 mr-1" />
              Disable Alerts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(true)}
              className="h-8 text-xs border-[#4E724C] text-[#4E724C] hover:bg-[#4E724C]/10"
              title="알림 설정"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={subscribeToPush}
            disabled={isLoading}
            className="h-8 text-xs border-[#4E724C] text-[#4E724C] hover:bg-[#4E724C]/10"
          >
            <Bell className="w-3 h-3 mr-1" />
            {isLoading ? 'Enabling...' : 'Enable Alerts'}
          </Button>
        )}
      </div>
      
      <NotificationPreferences 
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={async (settings) => {
          // 설정을 데이터베이스에 저장 후 실제 알림 구독 처리
          try {
            const preferences = {
              hours_before: settings.custom_times,
              daily_summary: settings.daily_summary,
              daily_summary_time: settings.daily_summary_time,
              timezone: settings.timezone
            }

            // 데이터베이스에 설정 저장
            await supabase
              .from('push_subscriptions')
              .upsert({
                user_id: user.id,
                notification_preferences: preferences
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
              })

            // 실제 알림 구독 처리
            await actuallySubscribeToPush()
          } catch (error) {
            console.error('Error saving notification settings:', error)
            toast.error('알림 설정 저장에 실패했습니다.')
          }
        }}
      />
    </>
  )
}