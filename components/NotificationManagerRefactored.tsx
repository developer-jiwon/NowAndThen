"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Settings, X, Calendar, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { notificationService, type NotificationSettings } from "@/lib/notification-service";

interface CountdownData {
  id: string;
  title: string;
  targetDate: string;
  isVisible: boolean;
}

export default function NotificationManagerRefactored() {
  const user = useUser();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testTimeout, setTestTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
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
      setPermission(currentPermission);
      setIsEnabled(currentPermission === 'granted' && notificationService.isSupported());
    }
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    loadSettings();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (testTimeout) {
        clearTimeout(testTimeout);
      }
    };
  }, [testTimeout]);

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

  const saveSettingsToStorage = () => {
    try {
      localStorage.setItem('nowandthen-notification-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  };

  const enableNotifications = async () => {
    if (!user) {
      toast.error('Please log in to enable notifications');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('[Mobile] Starting notification permission request...');
      
      // 상세한 모바일 디바이스 정보 로깅
      const userAgent = navigator.userAgent;
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      const isChrome = /Chrome/i.test(userAgent);
      const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
      
      console.log('[Mobile] Device info:', {
        userAgent,
        isMobile,
        isIOS,
        isAndroid,
        isChrome,
        isSafari,
        isPWA,
        notificationSupport: 'Notification' in window,
        serviceWorkerSupport: 'serviceWorker' in navigator,
        pushManagerSupport: 'PushManager' in window
      });
      
      if (isMobile) {
        toast.info(`📱 ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile'} device detected - requesting permission...`);
      }
      
      if (isIOS && !isPWA) {
        toast.error('iOS requires PWA mode for notifications. Please add to home screen first.');
        setIsLoading(false);
        return;
      }

      console.log('[Mobile] About to request permission...');
      const success = await notificationService.requestPermission();
      console.log('[Mobile] Permission request result:', success);
      console.log('[Mobile] Current method:', notificationService.getCurrentMethod());
      console.log('[Mobile] Has subscription:', !!notificationService.getCurrentSubscription());
      
      if (success) {
        // 구독 정보를 데이터베이스에 저장
        const saved = await notificationService.saveSubscription(user.id, settings);
        
        if (saved) {
          setIsEnabled(true);
          setPermission('granted');
          
          const method = notificationService.getCurrentMethod();
          toast.success(`Notifications enabled via ${method}!`);
          
          if (isPWA) {
            toast.info('PWA mode detected - enhanced notification experience');
          }

          // 설정과 카운트다운 데이터를 서비스 워커에 전송
          await updateServiceWorkerData();
          
        } else {
          toast.error('Failed to save notification settings');
        }
      } else {
        console.warn('[Mobile] Permission request failed or denied');
        toast.error('Notification permission denied. Please allow notifications in your browser settings.');
      }
    } catch (error: any) {
      console.error('[Mobile] Error enabling notifications:', error);
      
      if (error.message.includes('iOS requires PWA')) {
        toast.error('iOS: Please add to home screen first, then try again');
      } else if (error.message.includes('blocked')) {
        toast.error('Notifications blocked. Please enable in browser settings.');
      } else {
        toast.error(`Failed to enable notifications: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    setIsLoading(true);
    
    try {
      await notificationService.unsubscribe();
      setIsEnabled(false);
      toast.success('Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const updateServiceWorkerData = async () => {
    if (!user) return;

    try {
      // 카운트다운 데이터 가져오기 (localStorage에서)
      const countdowns: CountdownData[] = [];
      const savedCountdowns = localStorage.getItem(`countdowns-${user.id}`);
      
      if (savedCountdowns) {
        const parsed = JSON.parse(savedCountdowns);
        countdowns.push(...parsed.filter((c: any) => c.isVisible));
      }

      // 서비스 워커 업데이트
      await notificationService.updateServiceWorkerSettings(settings, countdowns);
      
    } catch (error) {
      console.error('Error updating service worker data:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!user) return;
    
    // 이미 테스트가 진행 중이면 취소하고 새로 시작
    if (testTimeout) {
      clearTimeout(testTimeout);
      setTestTimeout(null);
      toast.info('이전 테스트를 취소하고 새로 시작합니다');
    }

    try {
      // 상세한 디바이스 및 알림 상태 체크
      const userAgent = navigator.userAgent;
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      
      const currentMethod = notificationService.getCurrentMethod();
      const currentPermission = Notification.permission;
      
      console.log('[TestNotification] Device & Notification Status:', {
        userAgent,
        isMobile,
        isIOS,
        isAndroid,
        isPWA,
        currentMethod,
        currentPermission,
        isEnabled,
        notificationSupported: notificationService.isSupported()
      });
      

      
      // 모바일에서 알림이 안 오는 경우 체크
      if (isMobile && currentPermission !== 'granted') {
        toast.error('❌ 알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
        return;
      }
      
      if (isMobile && currentMethod === 'none') {
        toast.error('❌ 알림 방법이 설정되지 않았습니다. Enable Notifications를 먼저 눌러주세요.');
        return;
      }
      
      // PWA 종료 상태 확인을 위한 안내
      if (isPWA) {
        toast.success('📱 8초 후 알림 전송! 지금 앱을 완전히 종료하세요 (최근 앱에서도 제거)');
      } else if (isMobile) {
        toast.success('📱 8초 후 알림 전송! 지금 브라우저를 완전히 종료하세요');
      } else {
        toast.success('💻 8초 후 알림 전송! 지금 브라우저 탭을 닫거나 최소화하세요');
      }
      
      // 단 하나의 타이머만 설정 (중복 방지) - 8초로 변경
      const timeout = setTimeout(async () => {
        try {
          console.log('[Test] Sending notification after 8 seconds...');
          

          
          // 3. 실제 푸시 구독을 통한 서버 푸시 전송 (20초 후 하나의 알림만)
          try {
            console.log('[Test] 🔍 Checking current subscription...');
            const currentSubscription = await notificationService.getCurrentSubscription();
            console.log('[Test] Current subscription:', currentSubscription);
            
            if (currentSubscription) {
              console.log('[Test] ✅ Subscription found, sending to server...');
              console.log('[Test] Subscription endpoint:', currentSubscription.endpoint.substring(0, 50) + '...');
              
              const response = await fetch('/api/test-push-delayed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscription: currentSubscription
                })
              });
              
              if (response.ok) {
                const result = await response.json();
                console.log('[Test] ✅ Server response:', result);
                console.log('[Test] Delayed push notification scheduled via server (20s)');
              } else {
                console.error('[Test] ❌ Server error:', response.status, response.statusText);
              }
            } else {
              console.warn('[Test] ❌ No push subscription available');
              console.log('[Test] Current method:', notificationService.getCurrentMethod());
            }
          } catch (pushError) {
            console.error('[Test] ❌ Server push failed:', pushError);
          }
          
          setTestTimeout(null);
        } catch (error) {
          console.error('Error in delayed notification:', error);
          setTestTimeout(null);
        }
      }, 8000);
      
      setTestTimeout(timeout);
      
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('테스트 알림 전송 실패');
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // localStorage에 저장
      saveSettingsToStorage();
      
      // 데이터베이스에 저장
      await notificationService.saveSubscription(user.id, settings);
      
      // 서비스 워커 업데이트
      await updateServiceWorkerData();
      
      // 성공 메시지 설정
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
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const currentMethod = notificationService.getCurrentMethod();

  return (
    <>
      <div className="flex items-center gap-2">
        {isPWA && (
          <div className="text-xs text-[#4E724C] bg-[#4E724C]/10 px-2 py-1 rounded-full">
            PWA Mode
          </div>
        )}
        
        {currentMethod !== 'none' && (
          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            {currentMethod === 'firebase' ? 'FCM' : 'WebPush'}
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
              disabled={isLoading}
            >
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              className="h-8 text-xs border-orange-500 text-orange-500 hover:bg-orange-50"
              disabled={isLoading || !!testTimeout}
            >
              {testTimeout ? 'Testing...' : 'Test'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugInfo(true)}
              className="h-8 text-xs border-purple-500 text-purple-500 hover:bg-purple-50"
            >
              Debug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disableNotifications}
              className="h-8 text-xs"
              disabled={isLoading}
            >
              <BellOff className="w-3 h-3 mr-1" />
              Disable
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={enableNotifications}
            className="h-8 text-xs border-[#4E724C] text-[#4E724C] hover:bg-[#4E724C]/10"
            disabled={isLoading}
          >
            <Bell className="w-3 h-3 mr-1" />
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        )}
      </div>

      {/* Settings Modal */}
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
              {/* Countdown reminders */}
              {[
                { key: 'oneDay', label: '1 Day Before', value: settings.oneDay },
                { key: 'threeDays', label: '3 Days Before', value: settings.threeDays },
                { key: 'sevenDays', label: '7 Days Before', value: settings.sevenDays }
              ].map(({ key, label, value }) => (
                <div key={key} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, [key]: !value }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4E724C] focus:ring-offset-2 ${
                      value 
                        ? 'bg-gradient-to-r from-[#4E724C] to-[#5A7A56]' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}

              {/* Daily Summary */}
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
                        value={settings.dailySummaryTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, dailySummaryTime: e.target.value }))}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#4E724C] focus:border-[#4E724C]"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Daily summary at {settings.dailySummaryTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <Button
                onClick={saveSettings}
                className="flex-1 bg-[#4E724C] hover:bg-[#4E724C]/90 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
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

      {/* Debug Info Modal */}
      {showDebugInfo && (() => {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isAndroid = /Android/i.test(userAgent);
        const currentMethod = notificationService.getCurrentMethod();
        const currentPermission = Notification.permission;
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">📱 Mobile Debug Info</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebugInfo(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-700 mb-2">Device Info</h4>
                  <div className="space-y-1 text-xs">
                    <div>Mobile: {isMobile ? '✅' : '❌'}</div>
                    <div>iOS: {isIOS ? '✅' : '❌'}</div>
                    <div>Android: {isAndroid ? '✅' : '❌'}</div>
                    <div>PWA Mode: {isPWA ? '✅' : '❌'}</div>
                    <div className="break-all">UserAgent: {userAgent}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-700 mb-2">Notification Support</h4>
                  <div className="space-y-1 text-xs">
                    <div>Notification API: {'Notification' in window ? '✅' : '❌'}</div>
                    <div>Service Worker: {'serviceWorker' in navigator ? '✅' : '❌'}</div>
                    <div>Push Manager: {'PushManager' in window ? '✅' : '❌'}</div>
                    <div>Permission: {currentPermission}</div>
                    <div>Current Method: {currentMethod}</div>
                    <div>Service Supported: {notificationService.isSupported() ? '✅' : '❌'}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-700 mb-2">Troubleshooting Tips</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    {isIOS && !isPWA && <div>• iOS: Add to home screen first</div>}
                    {currentPermission === 'denied' && <div>• Enable notifications in browser settings</div>}
                    {currentMethod === 'none' && <div>• Click "Enable Notifications" first</div>}
                    {isMobile && <div>• Turn off battery optimization for browser</div>}
                    {isAndroid && <div>• Chrome Settings → Notifications → Allow</div>}
                    {isAndroid && <div>• Android Settings → Apps → Chrome → Notifications → Allow</div>}
                    {isAndroid && <div>• Check "Do Not Disturb" mode is off</div>}
                    {isIOS && <div>• iOS Settings → Safari → Notifications → Allow</div>}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-medium text-blue-700 mb-2">Quick Tests</h4>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('5초 후 테스트', {
                              body: '5초 후 알림이 작동합니다!',
                              icon: '/favicon.ico'
                            });
                          } else {
                            alert('Notification permission not granted');
                          }
                        } catch (error) {
                          alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }}
                      className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Browser Notification Test
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          const registration = await navigator.serviceWorker.ready;
                          if (registration.active) {
                            registration.active.postMessage({
                              type: 'test-notification'
                            });
                          } else {
                            alert('Service Worker not active');
                          }
                        } catch (error) {
                          alert(`SW Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }}
                      className="w-full text-xs bg-green-500 hover:bg-green-600 text-white"
                    >
                      Service Worker Test
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setShowDebugInfo(false)}
                className="w-full mt-6 bg-[#4E724C] hover:bg-[#4E724C]/90 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        );
      })()}
    </>
  );
}