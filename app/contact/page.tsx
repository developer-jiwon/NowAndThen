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
      
      <div className="mb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-merriweather text-4xl font-light text-slate-900 mb-6 leading-tight">
            Contact
          </h1>
          <div className="border-l-2 border-slate-900 pl-6 max-w-3xl">
            <p className="text-lg text-slate-700 leading-relaxed mb-4 font-light">
              Questions, suggestions, technical issues.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              We aim to respond within 1-2 business days.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* Contact Information */}
        <section className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-6">
                Email
              </h2>
              <div className="space-y-6">
                <div>
                  <a href="mailto:dev.jiwonnie@gmail.com" className="text-xl text-slate-900 hover:text-slate-600 transition-colors underline decoration-2 underline-offset-4">
                    dev.jiwonnie@gmail.com
                  </a>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  For technical support, feature requests, general feedback, or collaboration inquiries.
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-6">
                Response
              </h2>
              <div className="space-y-6">
                <div className="text-xl text-slate-900">
                  1-2 business days
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Every message gets a personal response. Complex technical issues may require additional time to investigate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What we help with */}
        <section className="max-w-4xl mx-auto">
          <h2 className="font-merriweather text-2xl font-light text-slate-900 mb-12 text-center">
            What We Address
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900">Technical Issues</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700">Sync problems across devices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700">Timer display or calculation errors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700">Data recovery assistance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700">Browser compatibility</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900">General Inquiries</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700">Feature suggestions and requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700">Collaboration inquiries</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700">General feedback and suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700">Usage feedback and suggestions</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Before contacting */}
        <section className="max-w-2xl mx-auto text-center py-16 border-t border-slate-200">
          <h2 className="font-merriweather text-xl font-light text-slate-900 mb-4">
            Before Emailing
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Many questions are answered in our existing documentation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
              <Link href="/faq" className="font-medium">
                Check FAQ
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Link href="/guide" className="font-medium">
                Read Guide
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Link href="/templates" className="font-medium">
                Browse Templates
              </Link>
            </Button>
          </div>
        </section>

        {/* Privacy */}
        <section className="max-w-2xl mx-auto text-center py-8 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            We respect your privacy. Contact information is used only for responding to your message.
            <br className="hidden sm:block" />
            <span className="sm:inline block mt-1 sm:mt-0">
              Details in our <Link href="/privacy-policy" className="text-slate-900 hover:underline font-medium">Privacy Policy</Link>.
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}