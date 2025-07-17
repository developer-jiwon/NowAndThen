"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SupabaseCountdownGrid from "@/components/supabase-countdown-grid"
import { Suspense, useEffect, useState } from "react"
import { Clock } from "@/components/ui/clock"
import ProfileMenu from "@/components/profile-menu";
import { useUser } from "@supabase/auth-helpers-react";
import LoginButton from "@/components/login-button";
import Link from "next/link";
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
        
        {/* Clean content links */}
        <div className="w-full max-w-md mx-auto mb-6 text-center">
          <div className="flex justify-center gap-3 mb-4 text-sm">
            <Link href="/guide" className="text-blue-600 hover:underline">Guide</Link>
            <Link href="/blog" className="text-blue-600 hover:underline">Blog</Link>
            <Link href="/templates" className="text-blue-600 hover:underline">Templates</Link>
          </div>
          <AdSenseComponent className="my-2" />
        </div>
        
        {/* Clean tabs for timer categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4 h-9 bg-gray-100 rounded-lg p-1">
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
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading timers...</div>}>
              <SupabaseCountdownGrid category="pinned" />
            </Suspense>
          </TabsContent>

          <TabsContent value="general">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading timers...</div>}>
              <SupabaseCountdownGrid category="general" />
            </Suspense>
          </TabsContent>

          <TabsContent value="personal">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading timers...</div>}>
              <SupabaseCountdownGrid category="personal" />
            </Suspense>
          </TabsContent>

          <TabsContent value="custom">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading timers...</div>}>
              <SupabaseCountdownGrid category="custom" />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="hidden">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading timers...</div>}>
              <SupabaseCountdownGrid category="hidden" showHidden={true} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

