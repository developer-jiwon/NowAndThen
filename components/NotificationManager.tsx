"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Settings, X, Calendar, Clock, CheckCircle, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import NotificationPreferences from "./NotificationPreferences";

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
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showTestResult, setShowTestResult] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [settings, setSettings] = useState<NotificationSettings>({
    oneDay: true,
    threeDays: true,
    sevenDays: false,
    dailySummary: false,
    dailySummaryTime: "09:00"
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
      console.log('Initial notification permission:', currentPermission);
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
      console.log('Requesting notification permission...');
      const result = await Notification.requestPermission();
      console.log('Permission result:', result);
      
      setPermission(result);
      setIsEnabled(result === 'granted');
      
      if (result === 'granted') {
        toast.success('Notifications enabled!');
        if (isPWA) {
          toast.info('In PWA mode, you will get a better notification experience');
        }
        await registerForNotifications();
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
  const registerForNotifications = async () => {
    if (!user) return;

    try {
      const { requestNotificationPermission } = await import('@/lib/firebase');
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        console.log('FCM Token received:', fcmToken);
        console.log('User ID:', user.id);
        
        // Supabase에 FCM 토큰 저장 (upsert 사용)
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            fcm_token: fcmToken,
            notification_preferences: {
              ...settings,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          
        if (error) {
          console.error('Error saving FCM token:', error);
          toast.error('Failed to register for notifications');
        } else {
          console.log('FCM token saved successfully');
          
          // 저장된 데이터 확인
          const { data: checkData, error: checkError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', user.id);
            
          console.log('Saved subscription data:', checkData);
          if (checkError) console.error('Check error:', checkError);
          
          toast.success('Successfully registered for notifications!');
        }
      } else {
        console.log('No FCM token received');
        toast.error('Failed to get FCM token');
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
      toast.error('Failed to register for notifications');
    }
  };

  const disableNotifications = () => {
    setIsEnabled(false);
    toast.success('Notifications disabled');
  };

  const sendTestNotification = async () => {
    try {
      console.log('=== TESTING RELIABLE SERVER PUSH ===');

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
      console.log('=== RUNNING AUTOMATED NOTIFICATION FLOW TEST ===');
      
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
        console.log('=== AUTOMATED TEST RESULTS ===');
        console.log(result);
        
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
    console.log('Saving notification settings:', settings);
    
    try {
      // Save settings to localStorage
      localStorage.setItem('nowandthen-notification-settings', JSON.stringify(settings));
      console.log('Settings saved to localStorage successfully');
      
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
        {isPWA && (
          <div className="text-xs text-[#4E724C] bg-[#4E724C]/10 px-2 py-1 rounded-full">
            PWA Mode
          </div>
        )}
        
        {permission === 'denied' ? (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <BellOff className="w-3 h-3" />
            <span>Notifications blocked</span>
          </div>
        ) : isEnabled ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-8 text-xs border-[#4E724C] text-[#4E724C] hover:bg-[#4E724C]/10"
              title="Notification settings"
            >
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </Button>
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

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">1 Day Before</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, oneDay: !prev.oneDay }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4E724C] focus:ring-offset-2 ${
                    settings.oneDay 
                      ? 'bg-gradient-to-r from-[#4E724C] to-[#5A7A56]' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out ${
                    settings.oneDay ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">3 Days Before</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, threeDays: !prev.threeDays }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4E724C] focus:ring-offset-2 ${
                    settings.threeDays 
                      ? 'bg-gradient-to-r from-[#4E724C] to-[#5A7A56]' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out ${
                    settings.threeDays ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">7 Days Before</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, sevenDays: !prev.sevenDays }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4E724C] focus:ring-offset-2 ${
                    settings.sevenDays 
                      ? 'bg-gradient-to-r from-[#4E724C] to-[#5A7A56]' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out ${
                    settings.sevenDays ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

                      {/* Daily Summary Section */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#4E724C]" />
                            <span className="text-sm font-medium text-gray-900">Daily Summary</span>
                          </div>
                          <button
                            onClick={() => setSettings(prev => ({ ...prev, dailySummary: !prev.dailySummary }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4E724C] focus:ring-offset-2 ${
                              settings.dailySummary 
                                ? 'bg-gradient-to-r from-[#4E724C] to-[#5A7A56]' 
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out ${
                              settings.dailySummary ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        {settings.dailySummary && (
                          <div className="ml-4 mt-2 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Notification time:</span>
                              <input
                                type="time"
                                value={settings.dailySummaryTime || "09:00"}
                                onChange={(e) => setSettings(prev => ({ ...prev, dailySummaryTime: e.target.value }))}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#4E724C] focus:border-[#4E724C]"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              You will receive a daily summary of your countdown status at {settings.dailySummaryTime}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
            
            <div className="flex gap-3 mt-8">
              <Button
                onClick={async (e) => {
                  console.log('=== SAVE BUTTON CLICKED ===');
                  
                  try {
                    // Save to localStorage
                    localStorage.setItem('nowandthen-notification-settings', JSON.stringify(settings));
                    
                    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    
                    // Update Supabase with new settings
                    if (user) {
                      console.log('Updating preferences for user:', user.id);
                      console.log('New settings:', settings);
                      
                      const { error } = await supabase
                        .from('push_subscriptions')
                        .update({
                          notification_preferences: {
                            ...settings,
                            timezone: userTimezone
                          },
                          updated_at: new Date().toISOString()
                        })
                        .eq('user_id', user.id);
                        
                      if (error) {
                        console.error('Error updating notification preferences:', error);
                        
                        // FCM 토큰 다시 등록 시도
                        console.log('Retrying FCM token registration...');
                        const { requestNotificationPermission } = await import('@/lib/firebase');
                        const fcmToken = await requestNotificationPermission();
                        
                        if (fcmToken) {
                          const { error: forceError } = await supabase
                            .from('push_subscriptions')
                            .upsert({
                              user_id: user.id,
                              fcm_token: fcmToken,
                              notification_preferences: {
                                ...settings,
                                timezone: userTimezone
                              },
                              updated_at: new Date().toISOString()
                            }, {
                              onConflict: 'user_id'
                            });
                            
                          if (!forceError) {
                            console.log('FCM token force registered successfully');
                          }
                        }
                      } else {
                        console.log('Notification preferences updated in database');
                        
                        // 업데이트 후 데이터 확인
                        const { data: updatedData, error: fetchError } = await supabase
                          .from('push_subscriptions')
                          .select('*')
                          .eq('user_id', user.id);
                          
                        console.log('Updated subscription data:', updatedData);
                        if (fetchError) console.error('Fetch error:', fetchError);
                      }
                    }
                    
                    // Send settings to Service Worker
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.ready.then((registration) => {
                        if (registration.active) {
                          registration.active.postMessage({
                            type: 'update-settings',
                            settings: settings,
                            userTimezone: userTimezone
                          });
                        }
                      });
                      
                      if (navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({
                          type: 'update-settings',
                          settings: settings,
                          userTimezone: userTimezone
                        });
                      }
                    }
                    
                    // Show cute success popup
                    if (settings.dailySummary) {
                      const currentTime = new Date().toLocaleTimeString('en-US', { 
                        hour12: false, 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                      setSuccessMessage(`${settings.dailySummaryTime}에 타이머 요약이 찾아갈게요! (현재 ${currentTime})`);
                    } else {
                      setSuccessMessage('알림 설정이 저장되었습니다');
                    }
                    setShowSuccessPopup(true);
                    
                    setShowSettings(false);
                    
                  } catch (error) {
                    console.error('Save failed:', error);
                    toast.error('Failed to save settings');
                  }
                }}
                className="flex-1 bg-[#4E724C] hover:bg-[#4E724C]/90 text-white font-medium"
                type="button"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

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