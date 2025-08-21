"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCircle } from "lucide-react";
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
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    oneDay: false,
    threeDays: false,
    sevenDays: false,
    dailySummary: true,
    dailySummaryTime: "08:30"
  });

  // Check if running as PWA and detect mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detect mobile devices
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      const isAndroid = /Android/.test(ua);
      setIsMobile(isIOS || isAndroid);
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = (window.navigator as any).standalone === true;
      setIsPWA(isStandalone || isInApp);
      
      // Check if PWA can be installed
      const checkInstallability = () => {
        // Check if the install prompt is available
        if ((window as any).deferredPrompt) {
          setCanInstallPWA(true);
        }
        
        // Also show install button if not in PWA mode (manual install guide)
        if (!isStandalone && !isInApp) {
          setCanInstallPWA(true);
        }
      };
      
      // Initial check
      checkInstallability();
      
      // Listen for custom events from layout.tsx
      const handlePWAInstallable = () => {
        console.log('PWA install prompt became available');
        setCanInstallPWA(true);
      };
      
      const handlePWAInstalled = () => {
        console.log('PWA was installed successfully');
        setCanInstallPWA(false);
        setIsPWA(true);
      };
      
      window.addEventListener('pwa-installable', handlePWAInstallable);
      window.addEventListener('pwa-installed', handlePWAInstalled);
      
      return () => {
        window.removeEventListener('pwa-installable', handlePWAInstallable);
        window.removeEventListener('pwa-installed', handlePWAInstalled);
      };
    }
  }, []);

  // Removed local PWA guide content; rely on global PWAInstallPrompt only

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

  // PWA install function
  const installPWA = () => {
    if (typeof window === 'undefined') return;
    const dp = (window as any).deferredPrompt;
    if (dp) {
      dp.prompt();
      dp.userChoice.finally(() => { (window as any).deferredPrompt = null; });
    } else {
      try { window.dispatchEvent(new Event('show-pwa-guide')); } catch {}
    }
  };

  const requestPermission = async () => {
    try {
      if (typeof window === 'undefined') return;
      // Robust PWA detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      const isInWebApk = document.referrer.includes('android-app://');
      const inPWA = isStandalone || isIOSStandalone || isInWebApk;
      const supportsNotification = 'Notification' in window;

      // If not in PWA OR Notifications API not available (iOS mobile browsers), show install guide
      if (!inPWA || !supportsNotification) {
        // Mobile browser: trigger unified guide reliably
        try {
          (window as any).NT_pendingGuide = true; // mark intent in case listener not mounted yet
          if ((window as any).NT_showInstallGuide) {
            (window as any).NT_showInstallGuide();
          } else {
            window.dispatchEvent(new Event('show-pwa-guide'));
          }
        } catch {}
        return;
      }

      // In PWA mode: actually request permission and subscribe
      toast.info('Requesting notification permission...');
      const ok = await registerForNotifications();
      if (ok) {
        setPermission('granted');
        toast.success("Notifications enabled. We'll remind you every day at 08:30.");
        setSuccessMessage('We will remind you every day at 08:30.');
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
      toast.error('Server push failed');
    } finally {
      setIsSending(false);
    }
  };

  // Dev/owner helper: trigger unified install guide
  const showInstallGuide = () => {
    if (typeof window !== 'undefined') {
      try { window.dispatchEvent(new Event('show-pwa-guide')); } catch {}
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

  // Render on all devices (allow testing in desktop browser as well)

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
              onClick={disableNotifications}
              className="h-8 text-xs"
              title="Disable notifications"
            >
              <BellOff className="w-3 h-3 mr-1" />
              Disable
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={requestPermission}
              className="h-8 text-xs border-[#4E724C] text-[#4E724C] hover:bg-[#4E724C]/10"
            >
              <Bell className="w-3 h-3 mr-1" />
              Enable Notifications
            </Button>
            {(!isPWA || canInstallPWA) && (
              <Button
                variant="outline"
                size="sm"
                onClick={installPWA}
                className="h-8 text-xs border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                title="Add app to home screen"
              >
                📱 Install App
              </Button>
            )}
            {/* Test Guide removed for production */}
          </div>
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

      {/* Local PWA guide removed to avoid duplicate modals */}
    </>
  );
}