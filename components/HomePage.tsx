"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SupabaseCountdownGrid from "@/components/supabase-countdown-grid"
import { Suspense, useEffect, useState } from "react"
import { Clock } from "@/components/ui/clock"
import { Calendar as CalendarIcon } from "lucide-react"
import ProfileMenu from "@/components/profile-menu";
import { useUser } from "@supabase/auth-helpers-react";
import LoginButton from "@/components/login-button";
import UpdatePopup from "@/components/update-popup";
import AdSenseComponent from "@/components/AdSenseComponent";
import NotificationManager from "@/components/NotificationManager";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default function HomePage() {
  const user = useUser();
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;
  const [activeTab, setActiveTab] = useState("pinned");
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['pinned', 'general', 'personal', 'holidays', 'hidden'].includes(hash)) {
      setActiveTab(hash);
    }
    const hasSeen = localStorage.getItem('nowandthen-v1.3');
    const lastShown = localStorage.getItem('nowandthen-v1.3-last-shown');
    const now = Date.now();
    
    // 한 번도 본 적이 없으면 표시 (7일 후 재표시 제거)
    if (!hasSeen) {
      setTimeout(() => setShowUpdatePopup(true), 2000); // 2초 후 표시로 변경
    }
  }, []);
  
  const handleCloseUpdatePopup = () => {
    setShowUpdatePopup(false);
    localStorage.setItem('nowandthen-v1.3', 'true');
    localStorage.setItem('nowandthen-v1.3-last-shown', Date.now().toString());
  };

  return (
    <>
      <UpdatePopup isVisible={showUpdatePopup} onClose={handleCloseUpdatePopup} />
      <PWAInstallPrompt />
      <main className="bg-white flex flex-col items-centersm:p-3 mt-20">
        <div className="container mx-auto max-w-6xl flex flex-col">
        <div className="flex flex-col items-center w-full mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="font-merriweather text-2xl sm:text-3xl font-bold text-gray-900">Now & Then</h1>
            <Clock size="sm" />
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-2">
            <ProfileMenu size="sm" />
            {isAnonymous ? (
              <button 
                onClick={() => (document.querySelector('[data-signin-trigger]') as HTMLElement)?.click()}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-[#4E724C] text-white rounded-md hover:bg-[#3A5A38] transition-colors"
              >
                Sign in
              </button>
            ) : null}
            <a href="/whats-new" className="inline-flex items-center gap-1 text-[11px] text-[#4E724C] hover:underline">
              <CalendarIcon className="w-3 h-3" />
              <span>Updates</span>
            </a>
          </div>
          {isAnonymous ? (
            <div className="text-center mb-2">
              <span className="text-gray-600 text-xs">
                Sign in to sync your timers across devices.<br />
                <span className="text-[10px] text-gray-400">Local data may be lost when clearing browser.</span>
              </span>
            </div>
          ) : (
            <div className="text-center mb-2">
              <span className="text-gray-600 text-sm">
                Your data is synced and secure.
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <LoginButton />
            {/* Notification manager without Settings UI */}
            <div className="notification-manager-wrapper">
              <NotificationManager />
            </div>
          </div>
        </div>
        
        {/* Removed the pink promo card for a cleaner hero. */}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full max-w-sm mx-auto justify-center space-x-4 mb-4 bg-transparent border-b border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0">
            <TabsTrigger value="pinned" className="text-xs font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 rounded-md pb-1 px-2 bg-transparent hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
              Pinned
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 rounded-md pb-1 px-2 bg-transparent hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
              General
            </TabsTrigger>
            <TabsTrigger value="personal" className="text-xs font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 rounded-md pb-1 px-2 bg-transparent hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
              Personal
            </TabsTrigger>
            <TabsTrigger value="holidays" className="text-xs font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 rounded-md pb-1 px-2 bg-transparent hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
              Holidays
            </TabsTrigger>
            <TabsTrigger value="hidden" className="text-xs font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 rounded-md pb-1 px-2 bg-transparent hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
              Hidden
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pinned" className="flex flex-col flex-1">
            <SupabaseCountdownGrid category="pinned" activeTab={activeTab} setActiveTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="general" className="flex flex-col flex-1">
            <SupabaseCountdownGrid category="general" activeTab={activeTab} setActiveTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="personal" className="flex flex-col flex-1">
            <SupabaseCountdownGrid category="personal" activeTab={activeTab} setActiveTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="holidays" className="flex flex-col flex-1">
            <SupabaseCountdownGrid category="holidays" activeTab={activeTab} setActiveTab={setActiveTab} />
          </TabsContent>
          
          <TabsContent value="hidden" className="flex flex-col">
            <SupabaseCountdownGrid category="hidden" showHidden={true} activeTab={activeTab} setActiveTab={setActiveTab} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 w-full max-w-4xl mx-auto px-4">
          <AdSenseComponent 
            className="flex justify-center w-full min-w-[320px]"
            adFormat="auto"
            pageType="content"
            adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME as string}
          />
        </div>
      </div>
      </main>
    </>
  )
}

