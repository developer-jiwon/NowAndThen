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
      
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900 tracking-tight">Now & Then</h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          A simple countdown timer that helps you track what matters most.
        </p>
      </div>

      <div className="space-y-12">
        {/* What it does - Simple */}
        <Card className="border-0 shadow-none bg-gray-50/50">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 leading-relaxed">
              Visual countdowns that put time in perspective and keep you focused on what matters.
            </p>
          </CardContent>
        </Card>

        {/* Key Features - Minimal */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-gray-200/60 hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <h3 className="font-medium mb-2 text-gray-900">Smart Organization</h3>
              <p className="text-sm text-gray-600">
                Pin urgent timers, organize by categories, search everything.
              </p>
            </CardContent>
          </Card>
          <Card className="border-gray-200/60 hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <h3 className="font-medium mb-2 text-gray-900">Count Up & Down</h3>
              <p className="text-sm text-gray-600">
                Expired timers become "Days Passed" counters for anniversaries.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA - Prominent */}
        <div className="text-center py-8">
          <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
            <Link href="/#custom">
              Get Started
            </Link>
          </Button>
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