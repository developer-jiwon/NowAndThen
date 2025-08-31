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
        datePublished: "2024-12-15",
        dateModified: "2025-08-20"
      })}</Script>
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-merriweather text-4xl font-light text-slate-900 mb-6 leading-tight">
            Usage Guide
          </h1>
          <div className="border-l-2 border-slate-900 pl-6 max-w-3xl">
            <p className="text-lg text-slate-700 leading-relaxed mb-4 font-light">
              From basic setup to advanced productivity patterns.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              Learn the proven strategies that turn time anxiety into focused action.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* Quick Start */}
        <section className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-6">
                Getting Started
              </h2>
              <div className="space-y-6">
                <p className="text-slate-700 leading-relaxed">
                  Creating your first timer takes 30 seconds. The psychological impact is immediate.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Navigate to <strong>Custom</strong> → Enter details → Watch urgency appear.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-6">Example Setup</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Title</span>
                  <span className="text-slate-900 font-medium">"Project Proposal Due"</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Date</span>
                  <span className="text-slate-900 font-medium">March 15, 2024</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Category</span>
                  <span className="text-slate-900 font-medium">General (Work)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Result</span>
                  <span className="text-slate-900 font-medium">"5 days, 14 hours left"</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Organization */}
        <section className="max-w-4xl mx-auto">
          <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-12 text-center">
            Organization Strategy
          </h2>
          
          <div className="space-y-8">
            <div className="border-l-4 border-slate-900 pl-8 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Pinned</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Reserve for genuine emergencies. Maximum 5 items. These should cause stress when you see them.
              </p>
              <p className="text-sm text-slate-600 italic">
                "If everything is urgent, nothing is urgent."
              </p>
            </div>
            
            <div className="border-l-4 border-slate-600 pl-8 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">General (Work)</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Professional deadlines, meetings, project milestones. The bulk of your productive work.
              </p>
              <p className="text-sm text-slate-600 italic">
                Most timers live here. Organized chaos becomes visible progress.
              </p>
            </div>
            
            <div className="border-l-4 border-slate-400 pl-8 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Personal (Life)</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Birthdays, anniversaries, personal goals. Life outside work matters too.
              </p>
              <p className="text-sm text-slate-600 italic">
                Separate context prevents work urgency from overwhelming personal time.
              </p>
            </div>
          </div>
        </section>

        {/* Advanced Patterns */}
        <section className="max-w-4xl mx-auto">
          <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-12 text-center">
            Advanced Patterns
          </h2>
          
          <div className="grid md:grid-cols-1 gap-12">
            <div className="bg-slate-50 p-8 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">The Buffer Method</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Set internal deadlines 2-3 days before external ones. When your timer hits zero, you have breathing room for polish and unexpected complications.
              </p>
              <div className="text-sm text-slate-600 bg-white p-4 border border-slate-200">
                <strong>Example:</strong> External deadline March 15 → Set timer for March 12
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Milestone Stacking</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Break large projects into sequential deadlines. Each completed timer builds momentum toward the final goal.
              </p>
              <div className="text-sm text-slate-600 bg-white p-4 border border-slate-200">
                <strong>Example:</strong> "Research Complete" → "First Draft" → "Review Round" → "Final Submit"
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Action-Oriented Titles</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Use verbs, not nouns. Your brain processes "Submit proposal" as an action to take, not an abstract concept to remember.
              </p>
              <div className="text-sm text-slate-600 bg-white p-4 border border-slate-200">
                <strong>Good:</strong> "Call mom", "Submit report", "Book flight"<br/>
                <strong>Bad:</strong> "Mom's call", "Report deadline", "Travel planning"
              </div>
            </div>
          </div>
        </section>

        {/* Interface Details */}
        <section className="max-w-4xl mx-auto">
          <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-12 text-center">
            Interface Mastery
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Global Search</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Search box finds timers across all categories. Type partial titles for instant filtering.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Persistence Memory</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Expired timers become "Days Passed" counters. Perfect for anniversaries and achievement tracking.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Context Menu</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Three dots beside each timer reveal pin, hide, edit, and delete actions.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Smart Labels</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Timers ending tomorrow automatically display "Tomorrow" instead of exact time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="max-w-2xl mx-auto text-center py-16 border-t border-slate-200">
          <h2 className="font-merriweather text-xl font-light text-slate-900 mb-4">
            Continue Learning
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Explore ready-made templates or find answers to specific questions.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
              <Link href="/templates" className="font-medium">
                Browse Templates
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Link href="/faq" className="font-medium">
                View FAQ
              </Link>
            </Button>
          </div>
        </section>

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