import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Us | Now & Then",
  description: "Get in touch with the Now & Then team. We'd love to hear from you about countdown timers and time management.",
  keywords: "contact, support, feedback, now and then, countdown timer",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900 tracking-tight">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="space-y-12">
        {/* Contact Information */}
        <Card className="border-gray-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              📧 Get In Touch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  ✉️ Email
                </h3>
                <p className="mb-2">
                  <a href="mailto:dev.jiwonnie@gmail.com" className="text-blue-700 hover:text-blue-800 font-semibold text-lg hover:underline">
                    dev.jiwonnie@gmail.com
                  </a>
                </p>
                <p className="text-sm text-blue-800">
                  For general inquiries, support, or feedback
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  ⏱️ Response Time
                </h3>
                <p className="text-green-800">We typically respond within 24-48 hours</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* What to contact us about */}
        <Card className="border-gray-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              🤝 What Can We Help With?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                    🔧 Technical Support
                  </h3>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      Login or sync issues
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      Timer not working properly
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      Data loss or recovery
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      Browser compatibility
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                    💬 General Inquiries
                  </h3>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      Feature requests
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      Partnership opportunities
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      Press and media
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      General feedback
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Before you contact */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">💡 Check These First</h2>
            <p className="text-gray-300 mb-8">
              Your question might already be answered in our comprehensive resources:
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                <Link href="/faq">
                  ❓ View FAQ
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                <Link href="/guide">
                  📚 Read Guide
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                <Link href="/templates">
                  📝 Browse Templates
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy note */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🔒</span>
              <h3 className="text-lg font-bold text-green-900">Privacy Protected</h3>
            </div>
            <p className="text-sm text-green-800">
              We respect your privacy. Your contact information will only be used to respond to your inquiry.
              <br className="hidden sm:block" />
              <span className="sm:inline block mt-1 sm:mt-0">
                Read our <Link href="/privacy-policy" className="text-green-900 hover:underline font-bold">Privacy Policy</Link> for more details.
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}