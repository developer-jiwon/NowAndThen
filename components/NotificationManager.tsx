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
  const [isSending, setIsSending] = useState(false);
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
      // Enabled only if there is an active push subscription
      (async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          const sub = await reg?.pushManager.getSubscription();
          setIsEnabled(!!sub);
        } catch {
          setIsEnabled(false);
        }
      })();
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    try {
      // Quick device checks for early feedback
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      const inPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      if (isIOS && !inPWA) {
        toast.error('On iOS, please “Add to Home Screen” and open the app to enable notifications.');
        return;
      }
      toast.info('Requesting notification permission...');
      // One unified flow: request + subscribe + save
      const ok = await registerForNotifications();
      if (ok) {
        setPermission('granted');
        toast.success('Notifications enabled. We\'ll remind you every day at 08:30.');
        setSuccessMessage("We will remind you every day at 08:30.");
        setShowSuccessPopup(true);
      } else {
        toast.error('Failed to enable notifications. Please check browser settings and try again.');
      }
    } catch (error) {
      console.warn('Notification permission request failed:', error);
      toast.error('Failed to request notification permission');
    }
  };

  // Create/ensure subscription (supports anonymous users)
  const registerForNotifications = async (): Promise<boolean> => {
    try {
      // Ensure we have a user id (anonymous allowed)
      let uid = user?.id;
      if (!uid) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error || !data?.user) {
          console.error('Anonymous sign-in failed:', error);
          return false;
        }
        uid = data.user.id;
      }

      // Ensure web push subscription exists
      const ok = await notificationService.requestPermission();
      if (!ok) return false;

      // Save minimal prefs: dailySummary true @ 08:30 (server fixed slots)
      const success = await notificationService.saveSubscription(uid, { ...settings, enabled: true });
      if (success) setIsEnabled(true);
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
      toast.error('Failed to disable notifications');
    }
  };

  const sendTestNotification = async () => {
    try {
      setIsSending(true);
      process.env.NODE_ENV === 'development' && console.log('=== TESTING RELIABLE SERVER PUSH ===');
      
      const response = await fetch('/api/test-push-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          title: '🚀 Server Push Test',
          message: 'Test notification from server (should arrive even when PWA is closed)'
        })
      });
      
      if (response.ok) {
        toast.success('Server push sent! Check your device for the notification.');
      } else {
        console.error('Server push failed:', response.status);
        toast.error('Server push failed');
      }
    } catch (error) {
      console.error('Failed to send server push:', error);
      toast.error('서버 푸시 실패');
    } finally {
      setIsSending(false);
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
          let resultText = '🚀 Automated Test Results:\n\n';
          
          // 각 단계별 결과 표시
          const tests = result.testResults;
          resultText += `✅ 1. FCM Token: ${tests.step1_fcm_token.status}\n`;
          resultText += `   Token: ${tests.step1_fcm_token.token}\n\n`;
          
          resultText += `✅ 2. Daily Summary Settings: ${tests.step2_daily_summary.status}\n`;
          resultText += `   Enabled: ${tests.step2_daily_summary.enabled}\n`;
          resultText += `   Time: ${tests.step2_daily_summary.time}\n`;
          resultText += `   Timezone: ${tests.step2_daily_summary.timezone}\n\n`;
          
          resultText += `✅ 3. Timer Data: ${tests.step3_timer_data.status}\n`;
          resultText += `   Total: ${tests.step3_timer_data.totalTimers} timers\n`;
          resultText += `   Visible: ${tests.step3_timer_data.visibleTimers} timers\n`;
          resultText += `   Today: ${tests.step3_timer_data.todayCount} timers\n`;
          resultText += `   Tomorrow: ${tests.step3_timer_data.tomorrowCount} timers\n`;
          resultText += `   This week: ${tests.step3_timer_data.thisWeekCount} timers\n\n`;
          
          resultText += `✅ 4. Notification Content: ${tests.step4_notification_content.status}\n`;
          resultText += `   Title: ${tests.step4_notification_content.title}\n`;
          resultText += `   Body: ${tests.step4_notification_content.body}\n\n`;
          
          resultText += `✅ 5. FCM Send: ${tests.step5_fcm_simulation.status}\n\n`;
          
          resultText += `🕐 6. Time Matching: ${tests.step6_time_matching.status}\n`;
          resultText += `   Current: ${tests.step6_time_matching.currentTime}\n`;
          resultText += `   Target: ${tests.step6_time_matching.targetTime}\n`;
          resultText += `   Difference: ${tests.step6_time_matching.timeDifference} minutes\n`;
          resultText += `   Send now?: ${tests.step6_time_matching.wouldSendNow ? 'Yes' : 'No'}\n\n`;
          
          if (tests.step6_time_matching.wouldSendNow) {
            resultText += '🎉 All conditions met! You will receive notifications even when PWA is closed!';
          } else {
            resultText += '⏰ Time doesn\'t match, no notifications will be sent now.\n';
            resultText += `Please test again at ${tests.step6_time_matching.targetTime}.`;
          }
          
          setTestResult(resultText);
          setShowTestResult(true);
          
          toast.success('Automated test completed!');
        } else {
          // 실패한 경우
          let errorText = `❌ Test Failed (Step ${result.step}):\n\n`;
          errorText += `Issue: ${result.issue}\n`;
          errorText += `Solution: ${result.solution}`;
          
          setTestResult(errorText);
          setShowTestResult(true);
          
          toast.error('There is an issue with notification settings');
        }
      } else {
        console.error('Automated test failed:', response.status);
        toast.error('Automated test failed');
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

  // Render even if not logged in (we create anonymous on enable)

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
            {user?.email === 'ji04wonton30@gmail.com' && (
              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
                disabled={isSending}
                className="h-8 text-xs border-orange-500 text-orange-500 hover:bg-orange-50"
                title="Test notification content"
              >
                {isSending ? 'Sending...' : 'Test'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={runAutomatedTest}
              className="h-8 text-xs border-blue-500 text-blue-500 hover:bg-blue-500"
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
                Setup Complete
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {successMessage}
              </p>
              <Button
                onClick={() => setShowSuccessPopup(false)}
                className="bg-[#4E724C] hover:bg-[#3A5A38] text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
              >
                OK
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
                Notification Preview
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
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}