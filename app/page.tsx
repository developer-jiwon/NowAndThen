"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SupabaseCountdownGrid from "@/components/supabase-countdown-grid"
import { Suspense, useEffect, useState } from "react"
import { Clock } from "@/components/ui/clock"
import ProfileMenu from "@/components/profile-menu";
import { useUser } from "@supabase/auth-helpers-react";
import LoginButton from "@/components/login-button";
import UpdatePopup from "@/components/update-popup";
// import Link from "next/link";
import AdSenseComponent from "@/components/AdSenseComponent";

export default function Home() {
  const user = useUser();
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;
  const [activeTab, setActiveTab] = useState("pinned");
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  
  useEffect(() => {
    // Check for hash in URL to set active tab
    const hash = window.location.hash.replace('#', '');
    if (hash && ['pinned', 'general', 'personal', 'custom', 'hidden'].includes(hash)) {
      setActiveTab(hash);
    }
    
    // Show update popup for v1.0
    // const hasSeenUpdate = localStorage.getItem('nowandthen-v1-update');
    // if (!hasSeenUpdate) {
    //   setTimeout(() => {
    //     setShowUpdatePopup(true);
    //   }, 1000); // Show after 1 second
    // }
  }, []);
  
  const handleCloseUpdatePopup = () => {
    setShowUpdatePopup(false);
    localStorage.setItem('nowandthen-v1-update', 'true');
  };

  return (
    <>
      {/* <UpdatePopup isVisible={showUpdatePopup} onClose={handleCloseUpdatePopup} /> */}
      <main className="bg-white flex flex-col items-centersm:p-3 mt-20">
        <div className="container mx-auto max-w-6xl flex flex-col">
        <div className="flex flex-col items-center w-full mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="font-merriweather text-2xl sm:text-3xl font-bold text-gray-900">Now & Then</h1>
            <Clock size="sm" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ProfileMenu size="sm" />
            {isAnonymous ? (
              <span className="text-gray-600 text-xs text-center">
                Sign in to sync your timers across devices.<br />
                <span className="text-[10px] text-gray-400">Local data may be lost when clearing browser.</span>
              </span>
            ) : (
              <span className="text-gray-600 text-sm text-center">
                Your data is synced and secure.
              </span>
            )}
          </div>
          <LoginButton />
        </div>
        
        {/* Welcome content and feature highlights */}
        {/* Master Your Time 안내 박스만 max-w-xl로 넓힘 */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto px-4 mb-4" style={{fontFamily: 'Inter, Pretendard, sans-serif'}}>
          <div className="rounded-2xl bg-[#E5C8CD] border border-[#E5C8CD]/30 p-3 sm:p-4 flex flex-col items-center">
            <p className="text-sm text-[#4A2C3A] mb-3 font-normal text-center" style={{letterSpacing: '0.01em'}}>
              Never miss what matters.<br />
              <span className="text-xs block mt-1 text-[#4A2C3A]/70">Effortless, beautiful, and always in sync.</span>
            </p>
            <ul className="flex flex-col sm:flex-row justify-center gap-4 text-xs text-[#4A2C3A] font-normal">
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A2C3A]" />
                Visual countdowns
              </li>
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A2C3A]" />
                Cross-device sync
              </li>
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A2C3A]" />
                Smart organization
              </li>
            </ul>
          </div>
          {/* 광고 자리 */}
          <div className="mt-3 w-full flex justify-center">
            {/* <AdSenseComponent /> */}
          </div>
        </div>
        
        {/* Clean tabs for timer categories */}
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
            <TabsTrigger value="custom" className="text-xs font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 rounded-md pb-1 px-2 bg-transparent hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
              Custom
            </TabsTrigger>
            <TabsTrigger value="hidden" className="text-xs font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 rounded-md pb-1 px-2 bg-transparent hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
              Hidden
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pinned" className="flex flex-col flex-1">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="pinned" activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>

          <TabsContent value="general" className="flex flex-col flex-1">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="general" activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>

          <TabsContent value="personal" className="flex flex-col flex-1">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="personal" activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>

          <TabsContent value="custom" className="flex flex-col flex-1">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="custom" activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="hidden" className="flex flex-col">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="hidden" showHidden={true} activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>
        </Tabs>
        
        {/* AdSense for main page with substantial content */}
        <div className="mt-6 w-full max-w-4xl mx-auto px-4">
          <AdSenseComponent 
            className="flex justify-center w-full min-w-[320px]"
            adFormat="auto"
            pageType="content"
          />
        </div>
      </div>
      </main>
    </>
  )
}

