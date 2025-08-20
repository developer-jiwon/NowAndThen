import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ | Now & Then",
  description: "Quick answers to common countdown timer questions.",
  keywords: "FAQ, countdown timer help, questions",
  alternates: { canonical: "/faq" },
};

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Do I need to sign in?",
    answer: "No, but signing in syncs your timers across devices."
  },
  {
    question: "Is my data private?",
    answer: "Yes. Local storage for anonymous use, encrypted cloud for signed-in users."
  },
  {
    question: "What's the difference between categories?",
    answer: "Pinned for urgent deadlines, General for work tasks, Personal for life events, Custom for anything else."
  },
  {
    question: "Can I recover deleted timers?",
    answer: "No. Use 'Hide' instead of 'Delete' to keep timers for reference."
  },
  {
    question: "What happens when a timer expires?",
    answer: "It automatically switches to 'Days Passed' mode and counts upward, perfect for tracking anniversaries or how long since a deadline."
  },
  {
    question: "Can I duplicate timers?",
    answer: "Yes, use the three-dot menu on any timer and select 'Duplicate'."
  },
  {
    question: "Can I edit a timer after creating it?",
    answer: "Yes, click the timer to edit the title, date, or time. Changes save automatically."
  },
  {
    question: "How many timers can I create?",
    answer: "No limit. However, we recommend keeping pinned timers under 10 for better focus."
  },
  {
    question: "Does it work offline?",
    answer: "Yes, the app works offline. Changes sync when you're back online if you're signed in."
  },
  {
    question: "Can I set reminders or notifications?",
    answer: "Currently no push notifications, but you can bookmark specific timers to check regularly."
  },
  {
    question: "What time zones does it support?",
    answer: "Timers use your device's local time zone automatically. No manual time zone setting needed."
  },
  {
    question: "Is there a mobile app?",
    answer: "The web app works great on mobile browsers. You can add it to your home screen for app-like experience."
  },
  {
    question: "Can I share timers with others?",
    answer: "Currently timers are private to your account. Sharing features may be added in future updates."
  },
  {
    question: "What if I forget my login?",
    answer: "We use Google OAuth, so you'll use your Google account. If you can't access Google, your local timers will still work."
  }
];

export default function FAQ() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Script id="ld-faq" type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: (
          [
            { question: "Do I need to sign in?", answer: "No, but signing in syncs your timers across devices." },
            { question: "Is my data private?", answer: "Yes. Local storage for anonymous use, encrypted cloud for signed-in users." },
            { question: "What's the difference between categories?", answer: "Pinned for urgent deadlines, General for work tasks, Personal for life events, Custom for anything else." }
          ]
        ).map(q => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: { "@type": "Answer", text: q.answer }
        }))
      })}</Script>
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-merriweather text-4xl font-light text-slate-900 mb-6 leading-tight">
            Questions
          </h1>
          <div className="border-l-2 border-slate-900 pl-6 max-w-3xl">
            <p className="text-lg text-slate-700 leading-relaxed mb-4 font-light">
              Direct answers to common concerns.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              Technical details, usage patterns, and everything else users typically ask.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {faqItems.map((item, index) => (
          <div key={index} className="border-b border-slate-200 pb-8">
            <h3 className="font-semibold text-slate-900 text-lg mb-4">
              {item.question}
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {item.answer}
            </p>
          </div>
        ))}
      </div>

      <section className="max-w-2xl mx-auto text-center py-16 border-t border-slate-200">
        <h2 className="font-merriweather text-xl font-light text-slate-900 mb-4">
          Still Curious?
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Browse our detailed guide or reach out directly for specific questions.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
            <Link href="/guide" className="font-medium">
              Read Guide
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            <Link href="/contact" className="font-medium">
              Contact Us
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
} 