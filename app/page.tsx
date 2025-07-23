"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SupabaseCountdownGrid from "@/components/supabase-countdown-grid"
import { Suspense, useEffect, useState } from "react"
import { Clock } from "@/components/ui/clock"
import ProfileMenu from "@/components/profile-menu";
import { useUser } from "@supabase/auth-helpers-react";
import LoginButton from "@/components/login-button";
// import Link from "next/link";
import AdSenseComponent from "@/components/AdSenseComponent";

export default function Home() {
  const user = useUser();
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;
  const [activeTab, setActiveTab] = useState("pinned");
  
  useEffect(() => {
    // Check for hash in URL to set active tab
    const hash = window.location.hash.replace('#', '');
    if (hash && ['pinned', 'general', 'personal', 'custom', 'hidden'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-2 sm:p-4 md:p-8">
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col justify-center">
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
        <div className="w-full max-w-md mx-auto px-4 mb-8" style={{fontFamily: 'Inter, Pretendard, sans-serif'}}>
          <div className="relative rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-gray-100 shadow-lg p-8 flex flex-col items-center overflow-hidden"
            style={{
              boxShadow: "0 8px 32px 0 rgba(236, 72, 153, 0.10), 0 1.5px 8px 0 rgba(59, 130, 246, 0.08)"
            }}
          >
            {/* 글로시 하이라이트 */}
            <div className="absolute left-8 top-4 w-1/3 h-7 bg-white/60 rounded-full blur-[2px] opacity-80 pointer-events-none" />
            {/* <h1 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
              Master Your <span className="text-pink-200">Time</span>
            </h1> */}
            <div className="flex justify-center mb-3">
              <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-pink-100 via-white/80 to-blue-100 opacity-80" />
            </div>
            <p className="text-base text-gray-600 mb-5 font-normal text-center" style={{letterSpacing: '0.01em'}}>
              Never miss what matters.<br />
              <span className="text-[13px] block mt-2 text-gray-400">Effortless, beautiful, and always in sync.</span>
            </p>
            <ul className="flex flex-col sm:flex-row justify-center gap-6 text-[14px] text-gray-500 font-normal">
              <li className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-100/80 shadow-md" />
                Visual countdowns
              </li>
              <li className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-100/80 shadow-md" />
                Cross-device sync
              </li>
              <li className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-white/80 border border-gray-200 shadow" />
                Smart organization
              </li>
            </ul>
          </div>
          {/* 광고 자리 */}
          <div className="mt-6 w-full flex justify-center">
            {/* <AdSenseComponent /> */}
          </div>
        </div>
        
        {/* Clean tabs for timer categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xs sm:max-w-md mx-auto grid-cols-5 mb-0 h-9 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="pinned" className="text-xs font-medium rounded-md">
              Pinned
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs font-medium rounded-md">
              General
            </TabsTrigger>
            <TabsTrigger value="personal" className="text-xs font-medium rounded-md">
              Personal
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs font-medium rounded-md">
              Custom
            </TabsTrigger>
            <TabsTrigger value="hidden" className="text-xs font-medium rounded-md">
              Hidden
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pinned">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="pinned" activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>

          <TabsContent value="general">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="general" activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>

          <TabsContent value="personal">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="personal" activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>

          <TabsContent value="custom">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="custom" activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="hidden">
            <Suspense fallback={<div className="flex justify-center items-center py-2">Loading timers...</div>}>
              <SupabaseCountdownGrid category="hidden" showHidden={true} activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
          </TabsContent>
        </Tabs>
        
        {/* AdSense for main page with substantial content */}
        <div className="mt-6">
          <AdSenseComponent 
            className="flex justify-center"
            adFormat="auto"
            pageType="content"
          />
        </div>
      </div>
    </main>
  )
}

