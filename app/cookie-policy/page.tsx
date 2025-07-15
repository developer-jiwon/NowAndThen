"use client"

export default function CookiePolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Cookie Policy</h1>
      <p className="mb-4">Now & Then ("the Service", "we", "us") uses cookies and similar technologies to enhance your experience and improve our Service. This Cookie Policy explains what cookies are, how we use them, and your choices regarding cookies.</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <strong>What Are Cookies?</strong>
          <ul className="list-disc pl-5">
            <li>Cookies are small text files stored on your browser by websites.</li>
            <li>They are used for service usage analytics, login status, personalized ads, and more.</li>
          </ul>
        </li>
        <li>
          <strong>Purpose of Cookies</strong>
          <ul className="list-disc pl-5">
            <li>Service analytics and improvement</li>
            <li>User authentication and security</li>
            <li>Personalized advertising (Google AdSense)</li>
            <li>Integration with third-party services (Supabase, Google login, etc.)</li>
          </ul>
        </li>
        <li>
          <strong>Managing and Refusing Cookies</strong>
          <ul className="list-disc pl-5">
            <li>You can refuse or delete cookies via your browser settings.</li>
            <li>Refusing cookies may limit some features of the Service.</li>
          </ul>
        </li>
        <li>
          <strong>Third-Party Cookies</strong>
          <ul className="list-disc pl-5">
            <li>Google (AdSense, login), Supabase, and other third-party providers may use cookies.</li>
          </ul>
        </li>
        <li>
          <strong>Policy Changes</strong>
          <ul className="list-disc pl-5">
            <li>This policy may be updated. Changes will be notified within the Service.</li>
          </ul>
        </li>
      </ol>
      <p className="mt-6 text-xs text-gray-500">Last updated: June 2024</p>
    </main>
  );
} 