"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Settings, X, Calendar, Clock, CheckCircle, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { notificationService } from "@/lib/notification-service";

interface NotificationSettings {
  oneDay: boolean;
  threeDays: boolean;
  sevenDays: boolean;
  dailySummary: boolean;
  dailySummaryTime: string; // "09:00" format
}

export default function NotificationManager() {
  const user = useUser();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // deprecated UI (kept false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showTestResult, setShowTestResult] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [settings, setSettings] = useState<NotificationSettings>({
    oneDay: false,
    threeDays: false,
    sevenDays: false,
    dailySummary: true,
    dailySummaryTime: "08:30"
  });

  // Check if running as PWA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = (window.navigator as any).standalone === true;
      setIsPWA(isStandalone || isInApp);
    }
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      process.env.NODE_ENV === 'development' && console.log('Initial notification permission:', currentPermission);
      setPermission(currentPermission);
      setIsEnabled(currentPermission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    try {
      process.env.NODE_ENV === 'development' && console.log('Requesting notification permission...');
      const result = await Notification.requestPermission();
      process.env.NODE_ENV === 'development' && console.log('Permission result:', result);
      
      setPermission(result);
      setIsEnabled(result === 'granted');
      
      if (result === 'granted') {
        const ok = await registerForNotifications();
        if (ok) {
          toast.success('Notifications enabled. We\'ll remind you every day at 08:30.');
          setSuccessMessage("We will remind you every day at 08:30.");
          setShowSuccessPopup(true);
        } else {
          toast.error('알림 등록에 실패했습니다.');
        }
      } else if (result === 'denied') {
        toast.error('Notification permission denied. Please allow it in your browser settings.');
      } else {
        toast.info('Notification permission requested. Please allow it in your browser.');
      }
    } catch (error) {
      console.warn('Notification permission request failed:', error);
      toast.error('Failed to request notification permission');
    }
  };

  // FCM 토큰 등록
  const registerForNotifications = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      // Ensure web push subscription exists
      const ok = await notificationService.requestPermission();
      if (!ok) return false;

      // Save minimal prefs: dailySummary true @ 08:30 (server uses fixed slots)
      const success = await notificationService.saveSubscription(user.id, settings);
      return success;
    } catch (error) {
      console.error('Error registering for notifications:', error);
      return false;
    }
  };

  const disableNotifications = async () => {
    try {
      await notificationService.unsubscribe();
      if (user) {
        await supabase
          .from('push_subscriptions')
          .update({ push_subscription: null, notification_preferences: { enabled: false } })
          .eq('user_id', user.id);
      }
    setIsEnabled(false);
    toast.success('Notifications disabled');
    } catch (e) {
      toast.error('알림 해제 실패');
    }
  };

  const sendTestNotification = async () => {
    try {
      process.env.NODE_ENV === 'development' && console.log('=== TESTING RELIABLE SERVER PUSH ===');
      
      const response = await fetch('/api/test-push-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          title: '🚀 Server Push Test',
          message: '서버에서 전송한 테스트 알림 (PWA 닫혀도 도착해야 함)'
        })
      });
      
      if (response.ok) {
        toast.success('서버 푸시 전송! 기기 알림 도착 여부를 확인하세요.');
      } else {
        console.error('Server push failed:', response.status);
        toast.error('서버 푸시 실패');
      }
    } catch (error) {
      console.error('Failed to send server push:', error);
      toast.error('서버 푸시 실패');
    }
  };

  const runAutomatedTest = async () => {
    try {
      process.env.NODE_ENV === 'development' && console.log('=== RUNNING AUTOMATED NOTIFICATION FLOW TEST ===');
      
      const response = await fetch('/api/test-notification-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        process.env.NODE_ENV === 'development' && console.log('=== AUTOMATED TEST RESULTS ===');
        process.env.NODE_ENV === 'development' && console.log(result);
        
        if (result.success) {
          let resultText = '🚀 자동화 테스트 결과:\n\n';
          
          // 각 단계별 결과 표시
          const tests = result.testResults;
          resultText += `✅ 1. FCM 토큰: ${tests.step1_fcm_token.status}\n`;
          resultText += `   토큰: ${tests.step1_fcm_token.token}\n\n`;
          
          resultText += `✅ 2. Daily Summary 설정: ${tests.step2_daily_summary.status}\n`;
          resultText += `   활성화: ${tests.step2_daily_summary.enabled}\n`;
          resultText += `   시간: ${tests.step2_daily_summary.time}\n`;
          resultText += `   타임존: ${tests.step2_daily_summary.timezone}\n\n`;
          
          resultText += `✅ 3. 타이머 데이터: ${tests.step3_timer_data.status}\n`;
          resultText += `   전체: ${tests.step3_timer_data.totalTimers}개\n`;
          resultText += `   보이는 타이머: ${tests.step3_timer_data.visibleTimers}개\n`;
          resultText += `   오늘: ${tests.step3_timer_data.todayCount}개\n`;
          resultText += `   내일: ${tests.step3_timer_data.tomorrowCount}개\n`;
          resultText += `   이번주: ${tests.step3_timer_data.thisWeekCount}개\n\n`;
          
          resultText += `✅ 4. 알림 내용: ${tests.step4_notification_content.status}\n`;
          resultText += `   제목: ${tests.step4_notification_content.title}\n`;
          resultText += `   내용: ${tests.step4_notification_content.body}\n\n`;
          
          resultText += `✅ 5. FCM 전송: ${tests.step5_fcm_simulation.status}\n\n`;
          
          resultText += `🕐 6. 시간 매칭: ${tests.step6_time_matching.status}\n`;
          resultText += `   현재: ${tests.step6_time_matching.currentTime}\n`;
          resultText += `   목표: ${tests.step6_time_matching.targetTime}\n`;
          resultText += `   차이: ${tests.step6_time_matching.timeDifference}분\n`;
          resultText += `   지금 보낼까?: ${tests.step6_time_matching.wouldSendNow ? '예' : '아니오'}\n\n`;
          
          if (tests.step6_time_matching.wouldSendNow) {
            resultText += '🎉 모든 조건 충족! PWA 닫아도 알림이 올 겁니다!';
          } else {
            resultText += '⏰ 시간이 맞지 않아 지금은 알림이 안 옵니다.\n';
            resultText += `${tests.step6_time_matching.targetTime}에 다시 테스트하세요.`;
          }
          
          setTestResult(resultText);
          setShowTestResult(true);
          
          toast.success('자동화 테스트 완료!');
        } else {
          // 실패한 경우
          let errorText = `❌ 테스트 실패 (단계 ${result.step}):\n\n`;
          errorText += `문제: ${result.issue}\n`;
          errorText += `해결책: ${result.solution}`;
          
          setTestResult(errorText);
          setShowTestResult(true);
          
          toast.error('알림 설정에 문제가 있습니다');
        }
      } else {
        console.error('Automated test failed:', response.status);
        toast.error('자동화 테스트 실패');
      }
    } catch (error) {
      console.error('Failed to run automated test:', error);
      toast.error('자동화 테스트 실패');
    }
  };

  const saveSettings = () => {
    process.env.NODE_ENV === 'development' && console.log('Saving notification settings:', settings);
    
    try {
      // Save settings to localStorage
      localStorage.setItem('nowandthen-notification-settings', JSON.stringify(settings));
      process.env.NODE_ENV === 'development' && console.log('Settings saved to localStorage successfully');
      
      toast.success('Notification settings saved!');
      setShowSettings(false);
      
      // Send test notification immediately after saving
      setTimeout(() => {
        sendTestNotification();
      }, 500);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save notification settings');
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('nowandthen-notification-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (error) {
        console.warn('Failed to load notification settings:', error);
      }
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        
        {permission === 'denied' ? (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <BellOff className="w-3 h-3" />
            <span>Notifications blocked</span>
          </div>
        ) : isEnabled ? (
          <>
            {/* Settings removed by product decision */}
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              className="h-8 text-xs border-orange-500 text-orange-500 hover:bg-orange-50"
              title="Test notification content"
            >
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runAutomatedTest}
              className="h-8 text-xs border-blue-500 text-blue-500 hover:bg-blue-50"
              title="Run automated flow test"
            >
              Auto Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disableNotifications}
              className="h-8 text-xs"
              title="Disable notifications"
            >
              <BellOff className="w-3 h-3 mr-1" />
              Disable
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
            Enable Notifications
          </Button>
        )}
      </div>

      {/* Settings modal removed */}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="w-12 h-12 text-[#4E724C]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                설정 완료
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {successMessage}
              </p>
              <Button
                onClick={() => setShowSuccessPopup(false)}
                className="bg-[#4E724C] hover:bg-[#3A5A38] text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Popup */}
      {showTestResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                알림 미리보기
              </h3>
              <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {testResult}
                </pre>
              </div>
              <Button
                onClick={() => setShowTestResult(false)}
                className="bg-[#4E724C] hover:bg-[#3A5A38] text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}