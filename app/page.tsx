import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SupabaseCountdownGrid from "@/components/supabase-countdown-grid"
import SupabaseUserIdentifier from "@/components/supabase-user-identifier"
import { Suspense } from "react"
import { Clock } from "@/components/ui/clock"
import dynamic from "next/dynamic"

const LoginButton = dynamic(() => import("@/components/login-button"), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-2 sm:p-4 md:p-8">
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center w-full mb-4 sm:mb-6">
          <div className="flex items-center justify-center">
            <h1 className="font-merriweather text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal">Now & Then</h1>
            <Clock />
          </div>
          {/* 로그인/로그아웃/회원탈퇴 버튼: 항상 타이틀 바로 아래, 한 줄로 배치 */}
          <div className="w-full flex flex-col items-center gap-2 mt-2 mb-2 px-2">
            <LoginButton />
          </div>
        </div>
        {/* <SupabaseUserIdentifier /> */}
        {/* 탭 메뉴 및 본문 */}
        <Tabs defaultValue="pinned" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4 sm:mb-8 text-[9px] sm:text-xs h-10 bg-gray-50/80 backdrop-blur-[2px] rounded-xl p-1.5 border border-gray-200 shadow-sm">
            <TabsTrigger 
              value="pinned" 
              data-value="pinned" 
              className="px-2 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[#36454F] font-medium"
            >
              Pinned
            </TabsTrigger>
            <TabsTrigger 
              value="general" 
              data-value="general" 
              className="px-2 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[#36454F] font-medium"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="personal" 
              data-value="personal" 
              className="px-2 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[#36454F] font-medium"
            >
              Personal
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              data-value="custom" 
              className="px-2 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[#36454F] font-medium"
            >
              Custom
            </TabsTrigger>
            <TabsTrigger 
              value="hidden" 
              data-value="hidden" 
              className="px-2 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-[#36454F] font-medium"
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

