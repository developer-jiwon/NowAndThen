import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates | Now & Then",
  description: "Quick countdown timer ideas for common use cases.",
  keywords: "countdown templates, timer ideas, deadline examples",
};

interface Template {
  id: string;
  title: string;
  emoji: string;
  description: string;
  examples: { title: string; days: string }[];
}

const templates: Template[] = [
  {
    id: "work",
    title: "Work & Career",
    emoji: "💼",
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
    emoji: "🎉",
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
    emoji: "💪",
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
    emoji: "📚", 
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
    emoji: "💰",
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
    emoji: "🎨",
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
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{template.emoji}</span>
                <h2 className="font-semibold text-gray-900">{template.title}</h2>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
            
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
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Ready to get started?</h3>
          <p className="text-blue-700 text-sm mb-4">Create your first timer using any of these ideas as inspiration.</p>
          <Link
            href="/#custom"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Create Timer
          </Link>
        </div>
      </div>
    </main>
  );
}