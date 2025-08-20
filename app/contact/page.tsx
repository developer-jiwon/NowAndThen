import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Now & Then",
  description: "Get in touch with the Now & Then team. We'd love to hear from you about countdown timers and time management.",
  keywords: "contact, support, feedback, now and then, countdown timer",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Contact Us</h1>
        <p className="text-xl text-gray-600">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="space-y-8">
        {/* Contact Information */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Get In Touch</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
              <p className="text-gray-600">
                <a href="mailto:dev.jiwonnie@gmail.com" className="text-blue-600 hover:underline">
                  dev.jiwonnie@gmail.com
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                For general inquiries, support, or feedback
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Response Time</h3>
              <p className="text-gray-600">We typically respond within 24-48 hours</p>
            </div>
          </div>
        </section>

        {/* What to contact us about */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">What Can We Help With?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                Technical Support
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Login or sync issues</li>
                <li>• Timer not working properly</li>
                <li>• Data loss or recovery</li>
                <li>• Browser compatibility</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                General Inquiries
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Feature requests</li>
                <li>• Partnership opportunities</li>
                <li>• Press and media</li>
                <li>• General feedback</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Before you contact */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Before You Contact Us</h2>
          <p className="text-gray-600 mb-6">
            Check if your question is already answered in our resources:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/faq"
              className="bg-gray-900 text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium text-center"
            >
              View FAQ
            </Link>
            <Link
              href="/guide"
              className="bg-white border border-gray-300 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
            >
              Read Guide
            </Link>
            <Link
              href="/templates"
              className="bg-white border border-gray-300 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
            >
              Browse Templates
            </Link>
          </div>
        </section>

        {/* Privacy note */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            We respect your privacy. Your contact information will only be used to respond to your inquiry.
            <br className="hidden sm:block" />
            <span className="sm:inline block mt-1 sm:mt-0">
              Read our <Link href="/privacy-policy" className="text-gray-900 hover:underline font-medium">Privacy Policy</Link> for more details.
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}