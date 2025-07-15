"use client"

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Now & Then ("the Service", "we", "us") values your privacy and complies with applicable laws and regulations. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <strong>Information We Collect</strong>
          <ul className="list-disc pl-5">
            <li>Email address (when logging in with Google)</li>
            <li>Service usage records (countdown data, etc.)</li>
            <li>Cookies and local storage information</li>
          </ul>
        </li>
        <li>
          <strong>Purpose of Collection and Use</strong>
          <ul className="list-disc pl-5">
            <li>To provide and improve the Service</li>
            <li>User authentication and security</li>
            <li>Personalized advertising (Google AdSense)</li>
          </ul>
        </li>
        <li>
          <strong>Retention and Deletion</strong>
          <ul className="list-disc pl-5">
            <li>Immediate deletion upon account withdrawal</li>
            <li>Retention as required by law</li>
          </ul>
        </li>
        <li>
          <strong>Cookies and Similar Technologies</strong>
          <ul className="list-disc pl-5">
            <li>Used for analytics, advertising, login status, etc.</li>
            <li>Users can refuse cookies via browser settings</li>
          </ul>
        </li>
        <li>
          <strong>Third-Party Sharing</strong>
          <ul className="list-disc pl-5">
            <li>Google (login, advertising)</li>
            <li>Supabase (data storage)</li>
          </ul>
        </li>
        <li>
          <strong>User Rights</strong>
          <ul className="list-disc pl-5">
            <li>Access, correction, and deletion of personal data</li>
            <li>Contact: [your email address]</li>
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