import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CountdownGrid from "@/components/countdown-grid"
import AddCountdownForm from "@/components/add-countdown-form"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-merriweather text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">Now & Then</h1>

        <Tabs defaultValue="pinned" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="pinned">
            <Suspense fallback={<div>Loading...</div>}>
              <CountdownGrid category="pinned" />
            </Suspense>
          </TabsContent>

          <TabsContent value="general">
            <Suspense fallback={<div>Loading...</div>}>
              <CountdownGrid category="general" />
            </Suspense>
          </TabsContent>

          <TabsContent value="personal">
            <Suspense fallback={<div>Loading...</div>}>
              <CountdownGrid category="personal" />
            </Suspense>
          </TabsContent>

          <TabsContent value="custom">
            <div className="mb-8">
              <AddCountdownForm />
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <CountdownGrid category="custom" />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

