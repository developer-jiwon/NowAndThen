"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

export default function NotificationManager() {
  const user = useUser();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  // Check if running as PWA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = window.navigator.standalone === true;
      setIsPWA(isStandalone || isInApp);
    }
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      console.log('Initial notification permission:', currentPermission);
      setPermission(currentPermission);
      setIsEnabled(currentPermission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('이 브라우저는 알림을 지원하지 않습니다');
      return;
    }

    try {
      console.log('Requesting notification permission...');
      const result = await Notification.requestPermission();
      console.log('Permission result:', result);
      
      setPermission(result);
      setIsEnabled(result === 'granted');
      
      if (result === 'granted') {
        toast.success('알림이 활성화되었습니다!');
        if (isPWA) {
          toast.info('PWA 모드에서 더 나은 알림 경험을 제공합니다');
        }
      } else if (result === 'denied') {
        toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.');
      } else {
        toast.info('알림 권한이 요청되었습니다. 브라우저에서 허용해주세요.');
      }
    } catch (error) {
      console.warn('Notification permission request failed:', error);
      toast.error('알림 권한 요청에 실패했습니다');
    }
  };

  const sendTestNotification = () => {
    console.log('Current permission:', permission);
    console.log('Is enabled:', isEnabled);
    
    if (permission === 'granted') {
      try {
        // Simple notification first
        const simpleNotification = new Notification('테스트 알림', {
          body: '이 알림이 보이나요?',
          icon: '/icons/nowandthen-icon.svg',
          requireInteraction: false, // Don't require interaction
          silent: false // Make sure sound is enabled
        });
        
        console.log('Simple notification sent:', simpleNotification);
        toast.success('간단한 테스트 알림을 보냈습니다!');
        
        // Close after 5 seconds
        setTimeout(() => {
          simpleNotification.close();
        }, 5000);
        
        // Also try the full notification
        setTimeout(() => {
          const fullNotification = new Notification('Now & Then', {
            body: isPWA ? 'PWA 모드에서 알림이 작동합니다! 🎉' : '알림이 정상적으로 작동합니다! 🎉',
            icon: '/icons/nowandthen-icon.svg',
            badge: '/icons/nowandthen-icon.svg',
            tag: 'test-notification',
            requireInteraction: true,
            vibrate: [200, 100, 200]
          });
          
          console.log('Full notification sent:', fullNotification);
          toast.success('전체 테스트 알림을 보냈습니다!');
          
        }, 2000);
        
      } catch (error) {
        console.error('Failed to send notification:', error);
        toast.error('알림 전송에 실패했습니다: ' + error.message);
      }
    } else {
      toast.error('알림 권한이 없습니다. 먼저 알림을 활성화해주세요.');
    }
  };

  const disableNotifications = () => {
    setIsEnabled(false);
    toast.success('알림이 비활성화되었습니다');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isPWA && (
        <div className="text-xs text-[#4E724C] bg-[#4E724C]/10 px-2 py-1 rounded-full">
          PWA 모드
        </div>
      )}
      
      {/* Debug info */}
      <div className="text-xs text-gray-500">
        권한: {permission} | 활성화: {isEnabled ? '예' : '아니오'}
      </div>
      
      {permission === 'denied' ? (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <BellOff className="w-3 h-3" />
          <span>알림 차단됨</span>
        </div>
      ) : isEnabled ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            className="h-8 text-xs border-[#4E724C] text-[#4E724C] hover:bg-[#4E724C]/10"
            title="테스트 알림 보내기"
          >
            <Bell className="w-3 h-3 mr-1" />
            테스트
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={disableNotifications}
            className="h-8 text-xs"
            title="알림 비활성화"
          >
            <BellOff className="w-3 h-3 mr-1" />
            비활성화
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={requestPermission}
          className="h-8 text-xs border-[#4E724C] text-[#4E724C] hover:bg-[#4E724C]/10"
        >
          <Bell className="w-3 h-3 mr-1" />
          알림 활성화
        </Button>
      )}
    </div>
  );
}