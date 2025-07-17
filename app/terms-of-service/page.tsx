import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Now & Then",
  description: "Read our Terms of Service to understand the rules and guidelines for using Now & Then countdown timer platform.",
  keywords: "terms of service, legal, terms and conditions, user agreement",
};

export default function TermsOfService() {
  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back to Home
      </Link>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Terms of Service</h1>
        <p className="text-gray-600">Last updated: January 2024</p>
      </div>

      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing and using Now & Then ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
            If you do not agree to these Terms, please do not use our Service.
          </p>
          <p className="text-gray-700 leading-relaxed">
            These Terms apply to all users of the Service, including visitors, registered users, and any other users of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Description of Service</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Now & Then is a web-based countdown timer platform that allows users to create, manage, and sync countdown timers 
            across multiple devices. Our Service includes features such as timer categorization, data synchronization, 
            and cross-platform access.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, 
            with or without notice to users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. User Accounts and Registration</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              You may use our Service without creating an account, but certain features require registration. 
              When you create an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Acceptable Use</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated tools to access the Service without permission</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. User Content and Data</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              You retain ownership of any content you create using our Service, including timer titles, dates, 
              and other data. By using our Service, you grant us a limited license to store, process, 
              and display your content solely for the purpose of providing the Service.
            </p>
            <p>
              You are responsible for the accuracy and legality of your content. We reserve the right to 
              remove content that violates these Terms or applicable laws.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Privacy and Data Protection</h2>
          <p className="text-gray-700 leading-relaxed">
            Your privacy is important to us. Our collection and use of your information is governed by our 
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>, 
            which is incorporated into these Terms by reference.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Intellectual Property</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              The Service and all related content, features, and functionality are owned by Now & Then 
              and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative works of our Service 
              without our explicit written permission.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Service Availability</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              While we strive to maintain high availability, we do not guarantee that the Service will be 
              available 100% of the time. The Service may be temporarily unavailable due to maintenance, 
              updates, or technical issues.
            </p>
            <p>
              We are not liable for any losses resulting from Service unavailability or data loss.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Limitation of Liability</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              To the maximum extent permitted by law, Now & Then shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to 
              loss of profits, data, or other intangible losses.
            </p>
            <p>
              Our total liability to you for any claims related to the Service shall not exceed 
              the amount you paid us in the twelve months preceding the claim.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Termination</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              You may terminate your account at any time by contacting us or using the account deletion 
              feature in your settings.
            </p>
            <p>
              We may terminate or suspend your account immediately if you violate these Terms or 
              engage in activities that may harm our Service or other users.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify these Terms at any time. We will notify users of significant 
            changes by posting the updated Terms on our website. Continued use of the Service after 
            changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">12. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws. 
            Any disputes arising from these Terms or the Service shall be resolved through binding arbitration.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">13. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms, please contact us at{" "}
            <a href="mailto:legal@nowandthen.app" className="text-blue-600 hover:underline">
              legal@nowandthen.app
            </a>
          </p>
        </section>
      </div>
    </main>
  );
} 