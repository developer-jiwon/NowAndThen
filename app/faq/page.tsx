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
      
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900 tracking-tight">FAQ</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Quick answers to everything you need to know about Now & Then.
        </p>
      </div>

      <div className="grid gap-4">
        {faqItems.map((item, index) => (
          <Card key={index} className="border-gray-200/60 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                ❓ {item.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold text-blue-900 mb-3">Still have questions?</h2>
          <p className="text-blue-800 mb-6">
            Check out our comprehensive guide or get in touch directly.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/guide">
                📚 Read Guide
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <Link href="/contact">
                💬 Contact Us
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 