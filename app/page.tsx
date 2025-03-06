import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CountdownGrid from "@/components/countdown-grid"
import AddCountdownForm from "@/components/add-countdown-form"
import { Suspense } from "react"
import { Clock } from "@/components/ui/clock"

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-2 sm:p-4 md:p-8">
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-center mb-4 sm:mb-8">
          <h1 className="font-merriweather text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal">Now & Then</h1>
          <Clock />
        </div>
        
        <div className="text-xs text-gray-400 text-center mb-4">
          <p>Your countdowns are automatically saved on this device</p>
        </div>
        
        <Tabs defaultValue="pinned" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-3 sm:mb-6 text-[10px] sm:text-xs h-8">
            <TabsTrigger value="pinned" data-value="pinned" className="px-2 py-1">Pinned</TabsTrigger>
            <TabsTrigger value="general" data-value="general" className="px-2 py-1">General</TabsTrigger>
            <TabsTrigger value="personal" data-value="personal" className="px-2 py-1">Personal</TabsTrigger>
            <TabsTrigger value="custom" data-value="custom" className="px-2 py-1">Custom</TabsTrigger>
            <TabsTrigger value="hidden" data-value="hidden" className="px-2 py-1">Hidden</TabsTrigger>
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

