import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Life Events Template | Now & Then",
  description: "Personal milestones template for birthdays, anniversaries, trips, and family events with practical examples.",
  alternates: { canonical: "/templates/personal" },
};

export default function PersonalTemplate() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Script id="ld-personal-article" type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Life Events Countdown Template",
        author: { "@type": "Person", name: "Now & Then Team" },
        datePublished: "2025-01-01",
        dateModified: "2025-01-01",
      })}</Script>

      <Link href="/templates" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700">← Back to Templates</Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">Life Events</h1>
      <p className="text-gray-600 mb-6">
        Celebrate and prepare with intention. This template focuses on the moments that matter: birthdays,
        anniversaries, reunions, and meaningful trips. Use memos to store gift ideas, dress codes, flight
        details, or checklists. When a date passes, it automatically becomes a count‑up timer so you can
        see how long it has been since that special day.
      </p>

      <div className="space-y-4">
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Suggested Timers</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
            <li>Sarah's Birthday</li>
            <li>Wedding Anniversary</li>
            <li>Family Reunion</li>
            <li>Vacation to Japan</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Tips</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 text-sm">
            <li>Use the memo to save links (hotel, venue, gift list).</li>
            <li>Pin approaching events 1–2 weeks before.</li>
            <li>Duplicate recurring events yearly to keep history.</li>
          </ul>
        </section>

        <section className="text-sm text-gray-600">
          <div className="flex gap-4">
            <Link href="/guide" className="text-[#4E724C] hover:underline">Read the Guide</Link>
            <Link href="/faq" className="text-[#4E724C] hover:underline">FAQ</Link>
            <Link href="/templates/work" className="text-[#4E724C] hover:underline">Work & Career</Link>
            <Link href="/templates/health" className="text-[#4E724C] hover:underline">Health & Fitness</Link>
          </div>
        </section>

        <div className="mt-6">
          <Link href="/#custom" className="inline-block bg-gradient-to-r from-[#4E724C] to-[#3A5A38] text-white px-5 py-2 rounded-lg text-sm hover:from-[#5A7F58] hover:to-[#4A6A48]">Use this template</Link>
        </div>
      </div>
    </main>
  );
}

