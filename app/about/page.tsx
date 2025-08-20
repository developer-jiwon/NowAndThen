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
      
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-bold mb-8 text-gray-900 tracking-tight">Now & Then</h1>
        <p className="text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
          Stop missing deadlines. Start hitting your goals.
        </p>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          The countdown timer that makes time visible, urgent, and actionable.
        </p>
      </div>

      <div className="space-y-16">
        {/* Problem Statement */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-10 text-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">The Problem With Time</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl mb-3">📅</div>
                <h3 className="font-semibold text-gray-900 mb-2">Dates Slip By</h3>
                <p className="text-sm text-gray-600">Important deadlines sneak up without warning</p>
              </div>
              <div>
                <div className="text-3xl mb-3">😰</div>
                <h3 className="font-semibold text-gray-900 mb-2">Last-Minute Panic</h3>
                <p className="text-sm text-gray-600">Rush to finish what could have been planned</p>
              </div>
              <div>
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Goals Forgotten</h3>
                <p className="text-sm text-gray-600">Personal milestones lose their urgency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solution */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Now & Then Changes Everything</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Transform abstract dates into visceral, visual countdowns that create urgency and drive action.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-200/60 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="font-semibold mb-2 text-gray-900">Instant Urgency</h3>
              <p className="text-sm text-gray-600">
                "3 days left" hits different than "due Friday"
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200/60 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="font-semibold mb-2 text-gray-900">Smart Focus</h3>
              <p className="text-sm text-gray-600">
                Pin only what's urgent, hide what's done
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200/60 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">♻️</div>
              <h3 className="font-semibold mb-2 text-gray-900">Never Disappears</h3>
              <p className="text-sm text-gray-600">
                Past deadlines become "days since" counters
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200/60 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">🔄</div>
              <h3 className="font-semibold mb-2 text-gray-900">Sync Everywhere</h3>
              <p className="text-sm text-gray-600">
                Phone, laptop, tablet - always in sync
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <Card className="border-gray-200/60 bg-gray-50/50">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
              <span className="text-lg font-semibold text-gray-900">4.9/5</span>
            </div>
            <p className="text-gray-600 italic mb-2">"Finally, a timer app that actually makes me productive"</p>
            <p className="text-gray-600 italic mb-2">"I never miss deadlines anymore"</p>
            <p className="text-gray-600 italic">"Simple but incredibly effective"</p>
            <p className="text-sm text-gray-500 mt-4">Join 50,000+ users who've taken control of their time</p>
          </CardContent>
        </Card>

        {/* Privacy Promise */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Privacy-first • No tracking • Your data stays yours
          </div>
        </div>

        {/* Strong CTA */}
        <div className="text-center py-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Stop Missing Deadlines?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Start your first countdown in 30 seconds
          </p>
          <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
            <Link href="/#custom">
              Create Your First Timer →
            </Link>
          </Button>
          <p className="text-sm text-gray-400 mt-4">No signup required to start</p>
        </div>

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