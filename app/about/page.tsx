import Link from "next/link";
import { Metadata } from "next";
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
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">About Now & Then</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Time is precious. Now & Then helps you make the most of it by tracking what matters most - your deadlines, goals, and life's important moments.
        </p>
      </div>

      <div className="space-y-8">
        {/* Simple Intro */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">What is Now & Then?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            A simple countdown timer app that helps you track deadlines and important dates. 
            Visual countdowns that put time in perspective and keep you focused on what matters.
          </p>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-gray-900">Smart Organization</h3>
              <p className="text-gray-600 text-sm">
                Pin urgent timers, organize by categories, search everything.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-gray-900">Count Up & Down</h3>
              <p className="text-gray-600 text-sm">
                Expired timers become "Days Passed" counters for anniversaries.
              </p>
            </div>
          </div>
        </section>



        {/* Simple CTA */}
        <section className="text-center py-6">
          <Link
            href="/#custom"
            className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Get Started
          </Link>
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