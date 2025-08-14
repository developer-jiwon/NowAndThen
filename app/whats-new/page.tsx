import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's New | Now & Then",
  description: "Release notes and improvements for Now & Then countdown app.",
  alternates: { canonical: "/whats-new" },
};

export default function WhatsNew() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700">← Back</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">What's New</h1>
      <p className="text-gray-600 mb-6">Product updates and notable improvements.</p>

      <div className="space-y-6">
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900">v1.1 • August 2025</h2>
          <ul className="list-disc pl-6 text-gray-700 text-sm mt-3 space-y-1">
            <li>PWA ready: installable app, service worker, offline page, iOS icon</li>
            <li>New calendar app icon applied across manifest and Home Screen</li>
            <li>Memo UX: instant save display, race-condition fix, auto-open when present</li>
            <li>Sorting controls: Lowest/Highest to quickly spot urgent timers</li>
          </ul>
        </section>
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900">v1.0 • August 2025</h2>
          <ul className="list-disc pl-6 text-gray-700 text-sm mt-3 space-y-1">
            <li>Memo for each timer + inline edit</li>
            <li>Unified Fern Green theme and Tea Rose accents</li>
            <li>Beautiful empty states for all tabs</li>
            <li>Improved SEO metadata, JSON‑LD, and sitemap</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

