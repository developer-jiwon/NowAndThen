import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdSenseComponent from "@/components/AdSenseComponent";

export const metadata: Metadata = {
  title: "Guide | Now & Then",
  description: "Master countdown timers with advanced tips and strategies for maximum productivity.",
  keywords: "timer guide, countdown tutorial, time management, productivity tips",
  alternates: { canonical: "/guide" },
};

export default function Guide() {
  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Script id="ld-guide-article" type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "How to Use Countdowns for Projects",
        author: { "@type": "Person", name: "Now & Then Team" },
        datePublished: "2025-01-01",
        dateModified: "2025-01-01"
      })}</Script>
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900 tracking-tight">Master Your Timers</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform from timer novice to productivity ninja with these proven strategies.
        </p>
      </div>

      <div className="space-y-12">
        {/* Quick Start */}
        <Card className="border-gray-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center text-lg font-bold">1</div>
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 text-lg">Go to <strong>Custom</strong> tab → Fill the form → Done!</p>
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">Title:</span> 
                    <span className="text-blue-700">"Q4 Sales Report Due"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">Date:</span> 
                    <span className="text-blue-700">Select from calendar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">Category:</span> 
                    <span className="text-blue-700">General/Personal/Custom</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Organization Strategy */}
        <Card className="border-gray-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center text-lg font-bold">2</div>
              Smart Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Card className="border-l-4 border-l-red-500 bg-red-50/50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-red-900 mb-2">🔥 Pinned</h3>
                  <p className="text-sm text-red-800">Only your top 3-5 most urgent items. Think "fire alarm" level importance.</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-blue-900 mb-2">💼 General</h3>
                  <p className="text-sm text-blue-800">Work deadlines, meetings, professional commitments.</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-green-900 mb-2">❤️ Personal</h3>
                  <p className="text-sm text-green-800">Life events, birthdays, personal goals and milestones.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Techniques */}
        <Card className="border-gray-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center text-lg font-bold">3</div>
              Power User Tactics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-1 gap-4">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <h3 className="font-bold text-purple-900 mb-2">🛡️ The "Buffer Zone" Method</h3>
                  <p className="text-sm text-purple-800">Set your timer 2-3 days before the real deadline. When it hits zero, you still have breathing room to polish and perfect.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                <CardContent className="p-4">
                  <h3 className="font-bold text-orange-900 mb-2">📚 Milestone Stacking</h3>
                  <p className="text-sm text-orange-800">For long projects, create multiple timers: "First Draft Due", "Review Complete", "Final Version". Breaks overwhelming deadlines into manageable chunks.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                <CardContent className="p-4">
                  <h3 className="font-bold text-teal-900 mb-2">🧠 Title Psychology</h3>
                  <p className="text-sm text-teal-800">Use action words: "Submit proposal", "Call mom", "Book flight". Your brain responds better to verbs than nouns.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Hidden Features */}
        <Card className="border-gray-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">💎 Hidden Gems</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">🔍</span>
                </div>
                <div>
                  <strong className="text-gray-900">Search Everything</strong>
                  <p className="text-sm text-gray-600 mt-1">The search bar finds timers by title across all categories instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">♻️</span>
                </div>
                <div>
                  <strong className="text-gray-900">Past = Present</strong>
                  <p className="text-sm text-gray-600 mt-1">Expired timers show "Days Passed" - perfect for tracking streaks or anniversaries.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">⚡</span>
                </div>
                <div>
                  <strong className="text-gray-900">Quick Actions</strong>
                  <p className="text-sm text-gray-600 mt-1">Click the dots on the left of any timer for pin, hide, edit, duplicate, or delete.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✨</span>
                </div>
                <div>
                  <strong className="text-gray-900">Tomorrow Magic</strong>
                  <p className="text-sm text-gray-600 mt-1">Timers ending tomorrow automatically show "Tomorrow" as the title.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Become a Timer Master?</h2>
            <p className="text-gray-300 mb-6">
              Get specific timer ideas or find answers to common questions.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                <Link href="/templates">
                  Browse Templates
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                <Link href="/faq">
                  View FAQ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AdSense for content-rich guide page */}
        <div className="mt-8">
          <AdSenseComponent 
            className="flex justify-center"
            adFormat="auto"
            pageType="content"
            adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE as string}
          />
        </div>

        {/* Call to Action */}
        {/* Removed the Apply These Techniques button as requested */}
      </div>
    </main>
  );
} 