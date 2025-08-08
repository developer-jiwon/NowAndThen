import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Now & Then",
  description: "Learn about how we use cookies and similar technologies on Now & Then countdown timer platform, including advertising and analytics cookies.",
  keywords: "cookie policy, cookies, tracking, advertising, analytics, privacy",
  alternates: { canonical: "/cookie-policy" },
};

export default function CookiePolicy() {
  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back to Home
      </Link>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Cookie Policy</h1>
        <p className="text-gray-600">Last updated: January 2024</p>
      </div>

      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. What Are Cookies?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) 
            when you visit a website. They help websites remember information about your visit, 
            which can make your next visit easier and the site more useful to you.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Cookies are widely used to make websites work more efficiently and provide a better user experience. 
            They also help website owners understand how their sites are being used.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. How We Use Cookies</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Essential Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                These cookies are necessary for our website to function properly and cannot be disabled. They include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Authentication cookies to keep you signed in</li>
                <li>Session cookies to maintain your preferences</li>
                <li>Security cookies to protect against malicious attacks</li>
                <li>Load balancing cookies to ensure site stability</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Functional Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                These cookies enhance your experience by remembering your choices:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>User interface preferences and settings</li>
                <li>Language and region preferences</li>
                <li>Timer display options and categories</li>
                <li>Recently accessed features</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Analytics Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use Google Analytics to understand how users interact with our site:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Page views and session duration</li>
                <li>User behavior and interaction patterns</li>
                <li>Popular features and content</li>
                <li>Technical performance metrics</li>
                <li>Geographic and demographic insights (anonymized)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Advertising Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use Google AdSense to display relevant advertisements:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Personalized ad targeting based on interests</li>
                <li>Frequency capping to limit ad repetition</li>
                <li>Performance measurement and optimization</li>
                <li>Cross-site behavioral advertising</li>
                <li>Conversion tracking for advertisers</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Third-Party Cookies</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Google Services</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We integrate several Google services that use their own cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Google Analytics:</strong> Website performance and usage analytics</li>
                <li><strong>Google AdSense:</strong> Advertising platform for displaying relevant ads</li>
                <li><strong>Google Fonts:</strong> Web font delivery service</li>
                <li><strong>Google OAuth:</strong> Authentication and sign-in services</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                For more information about Google's use of cookies, please visit{" "}
                <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Google's Cookie Policy
                </a>.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Social Media Integration</h3>
              <p className="text-gray-700 leading-relaxed">
                While we don't currently integrate social media sharing buttons, any future integrations 
                would involve third-party cookies from those platforms. We will update this policy 
                accordingly if such features are added.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Cookie Duration</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Session Cookies</h3>
              <p>
                These are temporary cookies that are deleted when you close your browser. 
                They're used for essential site functionality and security.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Persistent Cookies</h3>
              <p>
                These remain on your device for a specified period or until you delete them. 
                Duration varies from 24 hours to 2 years, depending on the cookie's purpose:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Authentication cookies: 30 days</li>
                <li>Preference cookies: 1 year</li>
                <li>Analytics cookies: 2 years</li>
                <li>Advertising cookies: Up to 2 years</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Managing Your Cookie Preferences</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Browser Settings</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>View and delete existing cookies</li>
                <li>Block all cookies from all websites</li>
                <li>Block cookies from specific websites</li>
                <li>Block third-party cookies</li>
                <li>Clear all cookies when you close the browser</li>
                <li>Receive notifications when cookies are being set</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Ad Personalization Controls</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You can control advertising cookies and personalization:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google Ad Settings
                  </a> - Manage your Google advertising preferences
                </li>
                <li>
                  <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Digital Advertising Alliance Opt-Out
                  </a> - Opt out of interest-based advertising
                </li>
                <li>
                  <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Your Online Choices
                  </a> - European interactive advertising opt-out
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Impact of Disabling Cookies</h3>
              <p className="text-gray-700 leading-relaxed">
                Please note that disabling certain cookies may affect your experience on our website:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                <li>You may need to sign in repeatedly</li>
                <li>Your preferences and settings may not be saved</li>
                <li>Some features may not work properly</li>
                <li>You may see less relevant advertisements</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Data Protection and Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our use of cookies is governed by our{" "}
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>. 
            We are committed to protecting your privacy and ensuring transparency about our data practices.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We only use cookies that are necessary for our service or that enhance your user experience. 
            We do not use cookies to collect personally identifiable information without your consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. International Considerations</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              We comply with applicable cookie laws and regulations, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>GDPR (General Data Protection Regulation)</strong> - European Union</li>
              <li><strong>CCPA (California Consumer Privacy Act)</strong> - California, USA</li>
              <li><strong>ePrivacy Directive</strong> - European Union</li>
              <li><strong>PIPEDA (Personal Information Protection and Electronic Documents Act)</strong> - Canada</li>
            </ul>
            <p className="mt-4">
              Depending on your location, you may have additional rights regarding cookie usage 
              and data processing. Please contact us if you have questions about your rights.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Updates to This Cookie Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in our practices, 
            technology, or legal requirements. We will notify you of any significant changes by 
            posting the updated policy on our website and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Contact Us</h2>
          <div className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              If you have any questions about this Cookie Policy or our use of cookies, please contact us:
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