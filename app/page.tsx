"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SupabaseCountdownGrid from "@/components/supabase-countdown-grid"
import SupabaseUserIdentifier from "@/components/supabase-user-identifier"
import { Suspense } from "react"
import { Clock } from "@/components/ui/clock"
import ProfileMenu from "@/components/profile-menu";
import { useUser } from "@supabase/auth-helpers-react";
import LoginButton from "@/components/login-button";

export default function Home() {
  const user = useUser();
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-2 sm:p-4 md:p-8">
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center w-full mb-1 sm:mb-1">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <h1 className="font-merriweather text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal whitespace-nowrap">Now & Then</h1>
            <Clock size="sm" />
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ProfileMenu size="sm" />
            {isAnonymous ? (
              <span className="text-gray-600 text-xs sm:text-sm text-center">
                Sign in to save and sync your timers.<br />
                <span className="text-[11px] text-gray-400">Without sign in, data may be lost.</span>
              </span>
            ) : (
              <span className="text-gray-600 text-sm sm:text-base text-center">
                Your timers are synced.
              </span>
            )}
          </div>
          <LoginButton />
        </div>
        {/* <SupabaseUserIdentifier /> */}
        {/* 탭 메뉴 및 본문 */}
        <Tabs defaultValue="pinned" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-1 sm:mb-1 text-[9px] sm:text-xs h-10 bg-white border border-gray-200/70 shadow-md rounded-2xl px-2 py-1">
            <TabsTrigger 
              value="pinned" 
              data-value="pinned" 
              className="px-2 py-1.5 rounded-xl font-semibold tracking-wide transition-colors duration-200 hover:bg-gray-50/80 data-[state=active]:sm:bg-white data-[state=active]:sm:text-charcoal data-[state=active]:sm:shadow data-[state=active]:sm:border-b-2 data-[state=active]:sm:border-primary data-[state=active]:bg-gray-100 data-[state=active]:text-charcoal"
            >
              Pinned
            </TabsTrigger>
            <TabsTrigger 
              value="general" 
              data-value="general" 
              className="px-2 py-1.5 rounded-xl font-semibold tracking-wide transition-colors duration-200 hover:bg-gray-50/80 data-[state=active]:sm:bg-white data-[state=active]:sm:text-charcoal data-[state=active]:sm:shadow data-[state=active]:sm:border-b-2 data-[state=active]:sm:border-primary data-[state=active]:bg-gray-100 data-[state=active]:text-charcoal"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="personal" 
              data-value="personal" 
              className="px-2 py-1.5 rounded-xl font-semibold tracking-wide transition-colors duration-200 hover:bg-gray-50/80 data-[state=active]:sm:bg-white data-[state=active]:sm:text-charcoal data-[state=active]:sm:shadow data-[state=active]:sm:border-b-2 data-[state=active]:sm:border-primary data-[state=active]:bg-gray-100 data-[state=active]:text-charcoal"
            >
              Personal
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              data-value="custom" 
              className="px-2 py-1.5 rounded-xl font-semibold tracking-wide transition-colors duration-200 hover:bg-gray-50/80 data-[state=active]:sm:bg-white data-[state=active]:sm:text-charcoal data-[state=active]:sm:shadow data-[state=active]:sm:border-b-2 data-[state=active]:sm:border-primary data-[state=active]:bg-gray-100 data-[state=active]:text-charcoal"
            >
              Custom
            </TabsTrigger>
            <TabsTrigger 
              value="hidden" 
              data-value="hidden" 
              className="px-2 py-1.5 rounded-xl font-semibold tracking-wide transition-colors duration-200 hover:bg-gray-50/80 data-[state=active]:sm:bg-white data-[state=active]:sm:text-charcoal data-[state=active]:sm:shadow data-[state=active]:sm:border-b-2 data-[state=active]:sm:border-primary data-[state=active]:bg-gray-100 data-[state=active]:text-charcoal"
            >
              Hidden
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pinned">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <SupabaseCountdownGrid category="pinned" />
            </Suspense>
          </TabsContent>

          <TabsContent value="general">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <SupabaseCountdownGrid category="general" />
            </Suspense>
          </TabsContent>

          <TabsContent value="personal">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <SupabaseCountdownGrid category="personal" />
            </Suspense>
          </TabsContent>

          <TabsContent value="custom">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <SupabaseCountdownGrid category="custom" />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="hidden">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <SupabaseCountdownGrid category="hidden" showHidden={true} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

