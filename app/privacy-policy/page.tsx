import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Now & Then",
  description: "Learn how we collect, use, and protect your personal information when you use Now & Then countdown timer platform.",
  keywords: "privacy policy, data protection, GDPR, personal information, data security",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back to Home
      </Link>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: January 2024</p>
      </div>

      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At Now & Then, we are committed to protecting your privacy and personal information. 
            This Privacy Policy explains how we collect, use, store, and protect your information 
            when you use our countdown timer platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By using our Service, you agree to the collection and use of information in accordance 
            with this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Information We Collect</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                When you create an account, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Email address (when signing in with Google)</li>
                <li>Display name and profile picture (from your Google account)</li>
                <li>Account preferences and settings</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Usage Data</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We automatically collect certain information when you use our Service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Timer titles, dates, and categories you create</li>
                <li>Device information (browser type, operating system)</li>
                <li>Usage patterns and feature interactions</li>
                <li>IP address and general location information</li>
                <li>Session duration and page views</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Cookies and Tracking</h3>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to enhance your experience. 
                See our <Link href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link> for detailed information.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. How We Use Your Information</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Provision:</strong> To provide, maintain, and improve our countdown timer platform</li>
              <li><strong>Data Synchronization:</strong> To sync your timers across multiple devices</li>
              <li><strong>Account Management:</strong> To manage your account and provide customer support</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
              <li><strong>Analytics:</strong> To understand how users interact with our Service and improve functionality</li>
              <li><strong>Communications:</strong> To send important updates about our Service (when necessary)</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Information Sharing and Disclosure</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform (e.g., cloud storage, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of our users or the public</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with user notification)</li>
              <li><strong>Consent:</strong> With your explicit consent for any other purpose</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Data Security</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure cloud infrastructure with redundancy and backups</li>
              <li>Employee training on data protection best practices</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Your Rights and Choices</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information and account</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Restriction:</strong> Request limitation of processing of your personal information</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:dev.jiwonnie@gmail.com" className="text-blue-600 hover:underline">
                dev.jiwonnie@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Data Retention</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>We retain your information for as long as necessary to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide you with our Service</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Improve our Service and user experience</li>
            </ul>
            <p className="mt-4">
              When you delete your account, we will delete your personal information within 30 days, 
              except where we are required to retain it for legal or security purposes.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your information in accordance 
            with this Privacy Policy and applicable data protection laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our Service is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If you become aware that a child 
            has provided us with personal information, please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Third-Party Services</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>Our Service may contain links to third-party websites or integrate with third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Authentication:</strong> For sign-in functionality</li>
              <li><strong>Google Analytics:</strong> For usage analytics and insights</li>
              <li><strong>Google AdSense:</strong> For displaying relevant advertisements</li>
            </ul>
            <p className="mt-4">
              These third parties have their own privacy policies. We recommend reviewing their 
              privacy practices before using their services.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date. 
            You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">12. Contact Us</h2>
          <div className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="space-y-2">
              <li>Email: <a href="mailto:dev.jiwonnie@gmail.com" className="text-blue-600 hover:underline">dev.jiwonnie@gmail.com</a></li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
} 