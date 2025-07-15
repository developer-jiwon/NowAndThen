import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-4 text-sm text-gray-500 hover:underline">← Back to Home</Link>
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
        <p className="mb-2">We collect only the information necessary to provide and improve our service, such as your email address and timer data.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">2. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-800">
          <li>To sync your timers across devices</li>
          <li>To provide customer support</li>
          <li>To improve our service and user experience</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">3. Data Sharing</h2>
        <p className="mb-2">We do not share your personal data with third parties except as required by law or with your explicit consent.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">4. Data Security</h2>
        <p className="mb-2">We use industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">5. Your Rights</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-800">
          <li>You can access, update, or delete your data at any time</li>
          <li>You can contact us for any privacy-related questions</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">6. Contact</h2>
        <p>For privacy concerns, contact <a href="mailto:dev.jiwonnie@gmail.com" className="underline">dev.jiwonnie@gmail.com</a></p>
      </section>
    </main>
  );
} 