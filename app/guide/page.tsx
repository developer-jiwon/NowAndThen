import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";
import AdSenseComponent from "@/components/AdSenseComponent";

export const metadata: Metadata = {
  title: "Guide | Now & Then",
  description: "Master countdown timers with advanced tips and strategies for maximum productivity.",
  keywords: "timer guide, countdown tutorial, time management, productivity tips",
  alternates: { canonical: "/guide" },
};

export default function Guide() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
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
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Master Your Timers</h1>
        <p className="text-lg text-gray-600">From basic setup to power-user strategies.</p>
      </div>

      <div className="space-y-8">
        {/* Quick Start */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">1</div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Start</h2>
          </div>
          <div className="ml-11 space-y-3">
            <p className="text-gray-600">Go to <strong>Custom</strong> tab → Fill the form → Done!</p>
            <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-300">
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Title:</span> <span className="text-gray-600">"Q4 Sales Report Due"</span></div>
                <div><span className="font-medium">Date:</span> <span className="text-gray-600">Select from calendar</span></div>
                <div><span className="font-medium">Category:</span> <span className="text-gray-600">General/Personal/Custom</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Strategy */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">2</div>
            <h2 className="text-xl font-semibold text-gray-900">Smart Organization</h2>
          </div>
          <div className="ml-11 space-y-4">
            <div className="grid gap-3">
              <div className="border-l-4 border-gray-800 pl-4 py-2">
                <span className="font-semibold text-gray-900">Pinned</span>
                <p className="text-sm text-gray-600 mt-1">Only your top 3-5 most urgent items. Think "fire alarm" level importance.</p>
              </div>
              <div className="border-l-4 border-gray-600 pl-4 py-2">
                <span className="font-semibold text-gray-900">General</span>
                <p className="text-sm text-gray-600 mt-1">Work deadlines, meetings, professional commitments.</p>
              </div>
              <div className="border-l-4 border-gray-500 pl-4 py-2">
                <span className="font-semibold text-gray-900">Personal</span>
                <p className="text-sm text-gray-600 mt-1">Life events, birthdays, personal goals and milestones.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Techniques */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">3</div>
            <h2 className="text-xl font-semibold text-gray-900">Power User Tactics</h2>
          </div>
          <div className="ml-11 space-y-4">
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">The "Buffer Zone" Method</h3>
                <p className="text-sm text-slate-700">Set your timer 2-3 days before the real deadline. When it hits zero, you still have breathing room to polish and perfect.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Milestone Stacking</h3>
                <p className="text-sm text-slate-700">For long projects, create multiple timers: "First Draft Due", "Review Complete", "Final Version". Breaks overwhelming deadlines into manageable chunks.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Title Psychology</h3>
                <p className="text-sm text-slate-700">Use action words: "Submit proposal", "Call mom", "Book flight". Your brain responds better to verbs than nouns.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Features */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hidden Gems</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <div>
                <strong>Search Everything:</strong> The search bar finds timers by title across all categories instantly.
              </div>
            </div>
            <div className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <div>
                <strong>Past = Present:</strong> Expired timers show "Days Passed" - perfect for tracking streaks or anniversaries.
              </div>
            </div>
            <div className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <div>
                <strong>Quick Actions:</strong> Click the dots on the left of any timer for pin, hide, edit, duplicate, or delete.
              </div>
            </div>
            <div className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <div>
                <strong>Tomorrow Magic:</strong> Timers ending tomorrow automatically show "Tomorrow" as the title.
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Psychology */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">The Psychology Edge</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Countdown Pressure:</strong> Your brain treats approaching deadlines as threats, naturally boosting focus and decision-making speed.
            </p>
            <p>
              <strong>Visual Urgency:</strong> Seeing "3 days" hits different than "due Friday" - numbers create immediate emotional response.
            </p>
            <p>
              <strong>Progress Satisfaction:</strong> Watching countdowns decrease gives micro-dopamine hits that maintain motivation over long projects.
            </p>
          </div>
        </div>

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