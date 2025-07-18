import Link from "next/link";
import { Metadata } from "next";
import { Briefcase, PartyPopper, Dumbbell, BookOpen, PiggyBank, Palette } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Templates | Now & Then",
  description: "Quick countdown timer ideas for common use cases.",
  keywords: "countdown templates, timer ideas, deadline examples",
};

interface Template {
  id: string;
  title: string;
  emoji: React.ReactNode; // Changed to React.ReactNode to accommodate Lucide icons
  description: string;
  examples: { title: string; days: string }[];
}

const templates: Template[] = [
  {
    id: "work",
    title: "Work & Career",
    emoji: <Briefcase className="w-6 h-6 text-blue-700" />, // replaced emoji
    description: "Professional deadlines and milestones",
    examples: [
      { title: "Q4 Budget Presentation", days: "15 days" },
      { title: "Performance Review Meeting", days: "7 days" },
      { title: "Project Launch", days: "30 days" },
      { title: "Conference Proposal Due", days: "21 days" }
    ]
  },
  {
    id: "personal",
    title: "Life Events",
    emoji: <PartyPopper className="w-6 h-6 text-pink-600" />, // replaced emoji
    description: "Personal milestones and celebrations",
    examples: [
      { title: "Sarah's Birthday", days: "12 days" },
      { title: "Wedding Anniversary", days: "45 days" },
      { title: "Vacation to Japan", days: "67 days" },
      { title: "Family Reunion", days: "23 days" }
    ]
  },
  {
    id: "health",
    title: "Health & Fitness",
    emoji: <Dumbbell className="w-6 h-6 text-green-600" />, // replaced emoji
    description: "Wellness goals and challenges",
    examples: [
      { title: "Marathon Training Start", days: "14 days" },
      { title: "30-Day Fitness Challenge", days: "5 days" },
      { title: "Doctor Appointment", days: "8 days" },
      { title: "Weight Goal Deadline", days: "90 days" }
    ]
  },
  {
    id: "learning",
    title: "Learning & Growth",
    emoji: <BookOpen className="w-6 h-6 text-yellow-600" />, // replaced emoji
    description: "Education and skill development",
    examples: [
      { title: "Certification Exam", days: "28 days" },
      { title: "Course Completion", days: "42 days" },
      { title: "Language Practice Streak", days: "100 days" },
      { title: "Book Club Discussion", days: "6 days" }
    ]
  },
  {
    id: "finance",
    title: "Money & Planning",
    emoji: <PiggyBank className="w-6 h-6 text-purple-600" />, // replaced emoji
    description: "Financial goals and deadlines",
    examples: [
      { title: "Tax Filing Deadline", days: "35 days" },
      { title: "Savings Goal", days: "180 days" },
      { title: "Investment Review", days: "90 days" },
      { title: "Budget Planning", days: "7 days" }
    ]
  },
  {
    id: "creative",
    title: "Creative Projects",
    emoji: <Palette className="w-6 h-6 text-orange-500" />, // replaced emoji
    description: "Artistic and creative pursuits",
    examples: [
      { title: "Art Exhibition Opening", days: "18 days" },
      { title: "Novel First Draft", days: "120 days" },
      { title: "Photography Challenge", days: "30 days" },
      { title: "Music Recital", days: "45 days" }
    ]
  }
];

export default function Templates() {
  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Timer Templates</h1>
        <p className="text-lg text-gray-600">Ready-to-use countdown ideas for every area of life.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div>{template.emoji}</div>
              <div>
                <CardTitle className="text-lg font-semibold">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {template.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{example.title}</span>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{example.days}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Removed the Ready to get started box for a cleaner, consistent UI */}
    </main>
  );
}