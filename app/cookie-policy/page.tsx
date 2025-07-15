"use client"

import Link from "next/link";

export default function CookiePolicy() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-4 text-sm text-gray-500 hover:underline">← Back to Home</Link>
      <h1 className="text-2xl font-bold mb-4">Cookie Policy</h1>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">1. What Are Cookies?</h2>
        <p className="mb-2">Cookies are small text files stored on your device to help websites remember your preferences and improve your experience.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">2. How We Use Cookies</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-800">
          <li>To keep you signed in</li>
          <li>To remember your preferences</li>
          <li>For analytics and performance</li>
          <li>To show relevant ads (Google AdSense)</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">3. Third-Party Cookies</h2>
        <p className="mb-2">We may use third-party cookies (such as Google) for analytics and advertising. These cookies are managed by their respective providers.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">4. Managing Cookies</h2>
        <p className="mb-2">You can control or delete cookies through your browser settings. Disabling cookies may affect your experience on our site.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">5. Contact</h2>
        <p>For questions about our cookie policy, contact <a href="mailto:dev.jiwonnie@gmail.com" className="underline">dev.jiwonnie@gmail.com</a></p>
      </section>
    </main>
  );
} 