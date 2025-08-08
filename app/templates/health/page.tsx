import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Health & Fitness Template | Now & Then",
  description: "Wellness and fitness template with example timers and best practices for challenges and appointments.",
  alternates: { canonical: "/templates/health" },
};

export default function HealthTemplate() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Script id="ld-health-article" type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Health & Fitness Countdown Template",
        author: { "@type": "Person", name: "Now & Then Team" },
        datePublished: "2025-01-01",
        dateModified: "2025-01-01",
      })}</Script>

      <Link href="/templates" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700">← Back to Templates</Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">Health & Fitness</h1>
      <p className="text-gray-600 mb-6">
        Build consistent habits with visual accountability. Use this template for training cycles,
        challenges, and medical appointments. Keep notes in memos for routines, target splits, or
        doctor instructions. Seeing the time left—or the time passed—keeps you motivated.
      </p>

      <div className="space-y-4">
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Suggested Timers</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
            <li>Marathon Training Start</li>
            <li>30‑Day Fitness Challenge</li>
            <li>Doctor Appointment</li>
            <li>Weight Goal Deadline</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Tips</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 text-sm">
            <li>Use memos for weekly training notes and adjustments.</li>
            <li>Pin this week’s focus; unpin when done to avoid clutter.</li>
            <li>Duplicate challenges to compare progress across months.</li>
          </ul>
        </section>

        <section className="text-sm text-gray-600">
          <div className="flex gap-4">
            <Link href="/guide" className="text-[#4E724C] hover:underline">Read the Guide</Link>
            <Link href="/faq" className="text-[#4E724C] hover:underline">FAQ</Link>
            <Link href="/templates/personal" className="text-[#4E724C] hover:underline">Life Events</Link>
            <Link href="/templates/work" className="text-[#4E724C] hover:underline">Work & Career</Link>
          </div>
        </section>

        <div className="mt-6">
          <Link href="/#custom" className="inline-block bg-gradient-to-r from-[#4E724C] to-[#3A5A38] text-white px-5 py-2 rounded-lg text-sm hover:from-[#5A7F58] hover:to-[#4A6A48]">Use this template</Link>
        </div>
      </div>
    </main>
  );
}

