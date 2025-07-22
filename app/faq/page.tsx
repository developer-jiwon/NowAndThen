import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Now & Then",
  description: "Quick answers to common countdown timer questions.",
  keywords: "FAQ, countdown timer help, questions",
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
    question: "How do count-up timers work?",
    answer: "Past dates automatically switch to count-up mode showing elapsed time."
  },
  {
    question: "Can I duplicate timers?",
    answer: "Yes, use the three-dot menu on any timer and select 'Duplicate'."
  },
  {
    question: "What happens when a timer expires?",
    answer: "It shows 'Days Passed' and counts upward, perfect for tracking anniversaries or how long since a deadline."
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
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">FAQ</h1>
        <p className="text-lg text-gray-600">Quick answers to common questions.</p>
      </div>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-2">{item.question}</h2>
            <p className="text-gray-600 text-sm">{item.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need more help? Check the{" "}
          <Link href="/guide" className="text-blue-600 hover:underline">
            Guide
          </Link>
        </p>
      </div>
    </main>
  );
} 