"use client"

import Head from "next/head"
import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-4 text-sm text-gray-500 hover:underline">← Back to Home</Link>
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="mb-2">By using Now & Then, you agree to these Terms of Service. Please read them carefully.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">2. Service Description</h2>
        <p className="mb-2">Now & Then allows you to create, manage, and sync countdown timers for personal and professional use. We strive to provide a reliable and secure service for all users.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">3. User Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-800">
          <li>Use the service in compliance with all applicable laws.</li>
          <li>Do not use Now & Then for unlawful, harmful, or abusive purposes.</li>
          <li>Keep your account information secure and confidential.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">4. Data & Privacy</h2>
        <p className="mb-2">Your data is securely stored and never shared with third parties without your consent. See our Privacy Policy for more details.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">5. Changes to Terms</h2>
        <p className="mb-2">We may update these Terms from time to time. Continued use of the service constitutes acceptance of the new terms.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">6. Contact</h2>
        <p>For questions, contact <a href="mailto:dev.jiwonnie@gmail.com" className="underline">dev.jiwonnie@gmail.com</a></p>
      </section>
    </main>
  );
} 