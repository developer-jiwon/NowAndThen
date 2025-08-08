import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Work & Career Template | Now & Then",
  description: "Use the Work & Career template to track project milestones, submissions, and review cycles. Clear structure and examples to get started fast.",
  alternates: { canonical: "/templates/work" },
};

export default function WorkTemplate() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Script id="ld-work-article" type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Work & Career Countdown Template",
        author: { "@type": "Person", name: "Now & Then Team" },
        datePublished: "2025-01-01",
        dateModified: "2025-01-01",
      })}</Script>

      <Link href="/templates" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700">← Back to Templates</Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">Work & Career</h1>
      <p className="text-gray-600 mb-6">
        Run your projects with clarity. The Work & Career template helps you structure deadlines for
        proposals, reviews, launches, and retrospectives. Add timers for each milestone so you and your
        team always see what is coming next. This layout works well for product releases, academic
        submissions, and quarterly goals. Pin the most urgent items, keep the rest in General, and hide
        completed ones to stay focused. Internal links below guide you to power techniques and FAQs.
      </p>

      <div className="space-y-4">
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Suggested Timers</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
            <li>Q4 Budget Presentation — target date</li>
            <li>Performance Review Meeting — calendar date</li>
            <li>Project Launch — release day</li>
            <li>Conference Proposal Due — submission deadline</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How to Use</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2 text-sm">
            <li>Create timers from the <Link href="/#custom" className="text-[#4E724C] hover:underline">Custom</Link> tab.</li>
            <li>Pin 3–5 critical items; leave the rest in General.</li>
            <li>Add a short memo to each timer for handoff notes.</li>
            <li>Duplicate and roll dates forward after each cycle.</li>
          </ol>
        </section>

        <section className="text-sm text-gray-600">
          <div className="flex gap-4">
            <Link href="/guide" className="text-[#4E724C] hover:underline">Read the Guide</Link>
            <Link href="/faq" className="text-[#4E724C] hover:underline">FAQ</Link>
            <Link href="/templates/personal" className="text-[#4E724C] hover:underline">Life Events</Link>
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

