import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CountdownGrid from "@/components/countdown-grid"
import AddCountdownForm from "@/components/add-countdown-form"
import UserIdentifier from "@/components/user-identifier"
import { Suspense } from "react"
import { Clock } from "@/components/ui/clock"
import UrlProcessor from "@/components/url-processor"
import CrossBrowserDataHandler from "@/components/cross-browser-data-handler"

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-2 sm:p-4 md:p-8">
      <UrlProcessor />
      <CrossBrowserDataHandler />
      
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <h1 className="font-merriweather text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal">Now & Then</h1>
          <Clock />
        </div>
        
        <UserIdentifier />
        
        <Tabs defaultValue="pinned" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4 sm:mb-8 text-[10px] sm:text-xs h-10 bg-gray-50/80 backdrop-blur-[2px] rounded-xl p-1.5 border border-gray-200 shadow-sm">
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
              <CountdownGrid category="pinned" />
            </Suspense>
          </TabsContent>

          <TabsContent value="general">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <CountdownGrid category="general" />
            </Suspense>
          </TabsContent>

          <TabsContent value="personal">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <CountdownGrid category="personal" />
            </Suspense>
          </TabsContent>

          <TabsContent value="custom">
            <div className="mb-4 sm:mb-8">
              <AddCountdownForm />
            </div>
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <CountdownGrid category="custom" />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="hidden">
            <Suspense fallback={<div className="flex justify-center items-center py-8">Loading...</div>}>
              <CountdownGrid category="hidden" showHidden={true} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

