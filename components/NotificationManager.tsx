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
  const [showPWAGuide, setShowPWAGuide] = useState(false);
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
      
      // Listen for PWA guide request from PWAInstallPrompt
      const handleShowPWAGuide = () => {
        console.log('PWA guide requested from PWAInstallPrompt');
        setShowPWAGuide(true);
      };
      
      window.addEventListener('show-pwa-guide', handleShowPWAGuide);
      
      return () => {
        window.removeEventListener('pwa-installable', handlePWAInstallable);
        window.removeEventListener('pwa-installed', handlePWAInstalled);
        window.removeEventListener('show-pwa-guide', handleShowPWAGuide);
      };
    }
  }, []);

  // Get device-specific PWA installation guide
  const getPWAGuide = () => {
    if (typeof window === 'undefined') return { title: '', steps: [] };
    
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isChrome = /Chrome/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    
    if (isIOS) {
      if (isSafari) {
        return {
          title: "Add to Home Screen (iPhone/iPad Safari)",
          steps: [
            "Tap the Share button (📤︎) at the bottom center of Safari",
            "Scroll down and tap 'Add to Home Screen'", 
            "Edit the name if desired, then tap 'Add'",
            "Open the app from your home screen"
          ]
        };
      } else {
        return {
          title: "Add to Home Screen (iPhone/iPad Chrome)",
          steps: [
            "Tap the Share button (📤︎) at the right end of the address bar",
            "Select 'Add to Home Screen'",
            "Tap 'Add' to install the app",
            "Open the app from your home screen"
          ]
        };
      }
    } else if (isAndroid) {
      if (isChrome) {
        return {
          title: "Add to Home Screen (Android Chrome)",
          steps: [
            "Tap the three dots menu (⋯) at the top right",
            "Select 'Add to Home Screen' or 'Install App'",
            "Tap 'Install' to add the app",
            "Open the app from your home screen or app drawer"
          ]
        };
      } else {
        return {
          title: "Add to Home Screen (Android Browser)",
          steps: [
            "Tap the menu button in your browser",
            "Look for 'Add to Home Screen' or 'Install App'",
            "Tap 'Install' to add the app",
            "Open the app from your home screen or app drawer"
          ]
        };
      }
    } else {
      return {
        title: "Add to Desktop (Computer)",
        steps: [
          "Click the menu (⋯) in your browser",
          "Look for 'Install' or 'Add to Desktop'",
          "Click 'Install' to add the app",
          "If no install option, bookmark this page for easy access"
        ]
      };
    }
  };

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
    if (typeof window !== 'undefined') {
      console.log('Install PWA button clicked');
      
      // Always try browser native prompt first, then fallback to guide
      if ((window as any).deferredPrompt) {
        console.log('Using browser native install prompt');
        const prompt = (window as any).deferredPrompt;
        prompt.prompt();
        
        prompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setCanInstallPWA(false);
            setIsPWA(true);
          } else {
            console.log('User dismissed the install prompt');
          }
          (window as any).deferredPrompt = null;
        });
      } else {
        // Always show manual guide as fallback
        console.log('No native install prompt available, showing manual guide');
        setShowPWAGuide(true);
      }
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    try {
      // Robust PWA detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      const isInWebApk = document.referrer.includes('android-app://');
      const inPWA = isStandalone || isIOSStandalone || isInWebApk;

      if (!inPWA) {
        // Mobile browser: show guide (no permission request here)
        setShowPWAGuide(true);
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

  // Don't render on desktop/non-mobile devices
  if (!isMobile) {
    return null;
  }

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

      {/* PWA Guide Popup */}
      {showPWAGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add to Home Screen
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Add this app to your home screen to enable notifications and use it like a regular app.
              </p>
              <div className="flex flex-col gap-2">
                {getPWAGuide().steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setShowPWAGuide(false)}
                className="bg-[#4E724C] hover:bg-[#3A5A38] text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 mt-4"
              >
                Got It!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}