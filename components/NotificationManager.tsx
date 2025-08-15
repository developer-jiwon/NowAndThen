"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Settings, X } from "lucide-react";
import { toast } from "sonner";

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

  const disableNotifications = () => {
    setIsEnabled(false);
    toast.success('Notifications disabled');
  };

  const saveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('nowandthen-notification-settings', JSON.stringify(settings));
    toast.success('Notification settings saved!');
    setShowSettings(false);
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
                          <span className="text-sm font-medium text-gray-900">Daily Summary</span>
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
                onClick={saveSettings}
                className="flex-1 bg-[#4E724C] hover:bg-[#4E724C]/90 text-white font-medium"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}