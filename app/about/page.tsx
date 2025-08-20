import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdSenseComponent from "@/components/AdSenseComponent";

export const metadata: Metadata = {
  title: "About | Now & Then",
  description: "Learn about Now & Then - a powerful yet simple countdown timer app for tracking deadlines and important moments.",
  keywords: "countdown timer, deadlines, time tracking, productivity, goals",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-merriweather text-4xl font-light text-slate-900 mb-6 leading-tight">
            About Now & Then
          </h1>
          <div className="border-l-2 border-slate-900 pl-6 max-w-3xl">
            <p className="text-lg text-slate-700 leading-relaxed mb-4 font-light">
              Time moves. Deadlines approach. Goals slip away.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              We built a countdown timer that transforms abstract dates into visceral urgency—making time visible, actionable, and impossible to ignore.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* The Problem */}
        <section className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-6">
                The Problem
              </h2>
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Important dates exist as abstract entries in calendars. 
                  "Due Friday" means nothing until Thursday night.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Our brains need urgency to prioritize. Without it, 
                  everything feels equally distant until it's suddenly urgent.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="border-l-2 border-slate-300 pl-4 py-3">
                <h3 className="font-semibold text-slate-900 mb-1">Invisible Deadlines</h3>
                <p className="text-sm text-slate-600">Calendar dates don't create urgency</p>
              </div>
              <div className="border-l-2 border-slate-400 pl-4 py-3">
                <h3 className="font-semibold text-slate-900 mb-1">Last-Minute Stress</h3>
                <p className="text-sm text-slate-600">Rushed work, missed opportunities</p>
              </div>
              <div className="border-l-2 border-slate-500 pl-4 py-3">
                <h3 className="font-semibold text-slate-900 mb-1">Lost Momentum</h3>
                <p className="text-sm text-slate-600">Goals fade without visible progress</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto">
          <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-8 text-center">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-merriweather font-bold text-slate-900">1</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Visible Time</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transform "Due March 15" into "3 days, 14 hours, 32 minutes"
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-merriweather font-bold text-slate-900">2</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Smart Organization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pin urgent items, categorize by context, hide completed work
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-merriweather font-bold text-slate-900">3</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Persistent Memory</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Past deadlines become achievement counters, not deleted mistakes
              </p>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="max-w-3xl mx-auto text-center">
          <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-6">
            The Result
          </h2>
          
          <div className="space-y-6">
            <blockquote className="border-l-4 border-slate-900 pl-6 text-left">
              <p className="text-lg text-slate-700 mb-3 font-light italic">
                "3 days left" creates immediate psychological pressure that "due Friday" never could.
              </p>
              <p className="text-slate-600">
                Your brain treats approaching numbers as threats, naturally boosting focus and decision-making speed.
              </p>
            </blockquote>
            
            <div className="bg-slate-50 p-6 border border-slate-200">
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-lg font-medium text-slate-900 mb-1">No Account Required</div>
                  <p className="text-sm text-slate-600">Start using immediately</p>
                </div>
                <div>
                  <div className="text-lg font-medium text-slate-900 mb-1">Works Offline</div>
                  <p className="text-sm text-slate-600">Always accessible</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto text-center py-8 border-t border-slate-200">
          <h2 className="font-merriweather text-xl font-light text-slate-900 mb-4">
            Start Now
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            No account required. Create your first countdown and see the difference urgency makes.
          </p>
          <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2">
            <Link href="/#custom" className="font-medium">
              Create Timer
            </Link>
          </Button>
        </section>

        {/* AdSense for content-rich about page */}
        <div className="mt-12">
          <AdSenseComponent 
            className="flex justify-center"
            adFormat="auto"
            pageType="content"
            adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ABOUT as string}
          />
        </div>
      </div>
    </main>
  );
} 