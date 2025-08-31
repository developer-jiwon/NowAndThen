import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";
import { Briefcase, PartyPopper, Dumbbell, BookOpen, PiggyBank, Palette } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdSenseComponent from "@/components/AdSenseComponent";

export const metadata: Metadata = {
  title: "Templates | Now & Then",
  description: "Quick countdown timer ideas for common use cases.",
  keywords: "countdown templates, timer ideas, deadline examples",
  alternates: { canonical: "/templates" },
};

interface Template {
  id: string;
  title: string;
  emoji: React.ReactNode; // Changed to React.ReactNode to accommodate Lucide icons
  description: string;
  examples: { title: string; days: string; memo: string }[];
  tips: string[];
}

const templates: Template[] = [
  {
    id: "work",
    title: "Work & Career",
    emoji: <Briefcase className="w-6 h-6 text-gray-600" />, // replaced emoji
    description: "Professional deadlines and milestones",
    examples: [
      { title: "Q4 Budget Presentation", days: "15 days", memo: "Key metrics: revenue +12%, costs -5%. Include market analysis slides." },
      { title: "Performance Review Meeting", days: "7 days", memo: "Prepare: project wins, skill developments, 2024 goals. Book conference room." },
      { title: "Project Launch", days: "30 days", memo: "Final testing week 1-7, marketing prep week 2-3, team training week 4." },
      { title: "Conference Proposal Due", days: "21 days", memo: "Topic: AI in productivity. Abstract draft done. Need bio update & speaker photo." }
    ],
    tips: [
      "Use memo feature to track key milestones and deliverables",
      "Set buffer time: aim to finish 2-3 days before the real deadline",
      "Pin only your top 3 most urgent work deadlines for better focus"
    ]
  },
  {
    id: "personal",
    title: "Life Events", 
    emoji: <PartyPopper className="w-6 h-6 text-gray-600" />, // replaced emoji
    description: "Personal milestones and celebrations",
    examples: [
      { title: "Sarah's Birthday", days: "12 days", memo: "Gift ideas: new camera lens, cooking class voucher. Book restaurant for 6pm." },
      { title: "Wedding Anniversary", days: "45 days", memo: "Weekend getaway to Napa. Hotel booked. Surprise dinner at the place we met." },
      { title: "Vacation to Japan", days: "67 days", memo: "Flight: March 15-29. Tokyo 5 days, Kyoto 3 days, Osaka 2 days. JR Pass ordered." },
      { title: "Family Reunion", days: "23 days", memo: "Grandma's 80th! Bring photo album. Coordinate potluck with cousins. Book hotel." }
    ],
    tips: [
      "Add gift ideas or celebration plans in the memo section",
      "Create countdown chains: 'Book flights', 'Pack bags', 'Departure day'",
      "Use expired timers to track 'Days since' special moments"
    ]
  },
  {
    id: "health",
    title: "Health & Fitness",
    emoji: <Dumbbell className="w-6 h-6 text-gray-600" />, // replaced emoji
    description: "Wellness goals and challenges",
    examples: [
      { title: "Marathon Training Start", days: "14 days", memo: "16-week plan. Week 1: 3mi runs x3. Buy new running shoes. Join running group." },
      { title: "30-Day Fitness Challenge", days: "5 days", memo: "Goal: 10k steps daily + 20min workout. Downloaded fitness app. Prep meal plans." },
      { title: "Doctor Appointment", days: "8 days", memo: "Annual checkup. Questions: knee pain, sleep issues. Bring insurance card & meds list." },
      { title: "Weight Goal Deadline", days: "90 days", memo: "Target: -15lbs. Current: 165lbs. Plan: keto diet + gym 4x/week. Track in MyFitnessPal." }
    ],
    tips: [
      "Use memos to log daily progress, workouts, or health metrics",
      "Create weekly mini-goals leading up to your main fitness target",
      "Track streaks with count-up timers after hitting initial goals"
    ]
  },
  {
    id: "learning",
    title: "Learning & Growth",
    emoji: <BookOpen className="w-6 h-6 text-gray-600" />, // replaced emoji
    description: "Education and skill development",
    examples: [
      { title: "Certification Exam", days: "28 days", memo: "AWS Solutions Architect. 4 practice tests done. Weak areas: VPC, IAM. 2hrs study daily." },
      { title: "Course Completion", days: "42 days", memo: "JavaScript Bootcamp - 60% done. Final project: todo app. 3 modules left." },
      { title: "Language Practice Streak", days: "100 days", memo: "Spanish daily goal: 30min Duolingo + 1 podcast episode. Currently B1 level." },
      { title: "Book Club Discussion", days: "6 days", memo: "'Atomic Habits' chapters 10-15. Key points: habit stacking, environment design." }
    ],
    tips: [
      "Use memos for study schedules, key concepts, or progress notes",
      "Break large courses into chapter-by-chapter countdown timers",
      "Create recurring study sessions with consistent timing"
    ]
  },
  {
    id: "finance",
    title: "Money & Planning",
    emoji: <PiggyBank className="w-6 h-6 text-gray-600" />, // replaced emoji
    description: "Financial goals and deadlines",
    examples: [
      { title: "Tax Filing Deadline", days: "35 days", memo: "Documents needed: W2, 1099, receipts. Deductions: home office, charity. CPA appt booked." },
      { title: "Savings Goal", days: "180 days", memo: "Emergency fund target: $15k. Current: $8.2k. Auto-transfer $350/month to savings." },
      { title: "Investment Review", days: "90 days", memo: "Q1 portfolio check. Rebalance if needed. 401k at 15%, IRA maxed. Consider REIT." },
      { title: "Budget Planning", days: "7 days", memo: "January spending review. Categories: groceries +$200, dining out -$150. Adjust limits." }
    ],
    tips: [
      "Record target amounts and current progress in memo fields",
      "Set quarterly money check-ins with recurring timer templates",
      "Use 'Days since' for tracking spending-free streaks or investment milestones"
    ]
  },
  {
    id: "creative",
    title: "Creative Projects",
    emoji: <Palette className="w-6 h-6 text-gray-600" />, // replaced emoji
    description: "Artistic and creative pursuits",
    examples: [
      { title: "Art Exhibition Opening", days: "18 days", memo: "12 paintings ready. Need frames for 3 pieces. Gallery visit Thu. Wine & cheese for 50 people." },
      { title: "Novel First Draft", days: "120 days", memo: "Thriller set in Tokyo. Target: 80k words. Chapter outline done. Write 700 words daily." },
      { title: "Photography Challenge", days: "30 days", memo: "Street photography project. 1 photo daily. Themes: urban life, shadows, people. Sony A7III ready." },
      { title: "Music Recital", days: "45 days", memo: "Piano pieces: Chopin Nocturne, Bach Invention. Practice 90min daily. Book studio for rehearsal." }
    ],
    tips: [
      "Use memos to capture creative ideas, inspiration, or daily progress",
      "Create milestone timers: 'Outline done', 'First act complete', 'Final edit'",
      "Turn finished projects into 'Days since completion' to track your creative journey"
    ]
  }
];

export default function Templates() {
  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Script id="ld-templates-article" type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Timer Templates for Common Use Cases",
        author: { "@type": "Person", name: "Now & Then Team" },
        datePublished: "2024-12-15",
        dateModified: "2025-08-20"
      })}</Script>
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-merriweather text-4xl font-light text-slate-900 mb-6 leading-tight">
            Templates
          </h1>
          <div className="border-l-2 border-slate-900 pl-6 max-w-3xl">
            <p className="text-lg text-slate-700 leading-relaxed mb-4 font-light">
              Proven timer patterns for work, life, and everything between.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              Each template includes real examples and strategic insights from productive users.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12">
        {templates.map((template) => (
          <Card key={template.id} className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="font-merriweather text-xl font-light text-slate-900 mb-2">
                {template.title}
              </CardTitle>
              <CardDescription className="text-slate-600 leading-relaxed">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                {/* Examples */}
                <div className="space-y-3">
                  {template.examples.map((example, index) => (
                    <div key={index} className="border-l-2 border-slate-300 pl-4 py-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-slate-900">{example.title}</span>
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{example.days}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        {example.memo}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Strategy Notes */}
                <div className="bg-slate-50 p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">Strategy Notes</h4>
                  <ul className="space-y-2">
                    {template.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AdSense for content-rich templates page */}
      <div className="mt-12">
        <AdSenseComponent 
          className="flex justify-center"
          adFormat="auto"
          pageType="content"
          adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TEMPLATES as string}
        />
      </div>

      {/* Removed the Ready to get started box for a cleaner, consistent UI */}
    </main>
  );
}