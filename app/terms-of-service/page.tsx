"use client"

import Head from "next/head"

export default function TermsOfServicePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Head>
        <title>Terms of Service | Now & Then</title>
        <meta name="description" content="Read the Terms of Service for Now & Then. Learn about user responsibilities and privacy." />
      </Head>
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4 text-base text-gray-700">
        By using Now & Then, you agree to use the service responsibly and respect the privacy of others. Your data is stored securely and can be deleted at any time by deleting your account.
      </p>
      <p className="text-gray-500 text-sm mt-6">
        For questions, please contact us at <a href="mailto:dev.jiwonnie@gmail.com" className="underline">dev.jiwonnie@gmail.com</a>.
      </p>
    </main>
  )
} 