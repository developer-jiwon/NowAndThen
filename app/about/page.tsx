import Link from "next/link";
import { Metadata } from "next";
import AdSenseComponent from "@/components/AdSenseComponent";

export const metadata: Metadata = {
  title: "About | Now & Then",
  description: "Learn about Now & Then - a powerful yet simple countdown timer app for tracking deadlines and important moments.",
  keywords: "countdown timer, deadlines, time tracking, productivity, goals",
};

export default function About() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">About Now & Then</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Time is precious. Now & Then helps you make the most of it by tracking what matters most - your deadlines, goals, and life's important moments.
        </p>
      </div>

      <div className="space-y-8">
        {/* The Story */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Why Now & Then?</h2>
          <div className="prose text-gray-700 space-y-3">
            <p>
              In our busy digital lives, important dates slip by unnoticed. Whether it's a project deadline, 
              a friend's birthday, or a personal milestone, time has a way of getting away from us.
            </p>
            <p>
              Now & Then was built to solve this simple but universal problem. It's not just another calendar app 
              or notification system - it's a visual countdown that puts time in perspective and creates urgency 
              when you need it most.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Built for Real Life</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-900">Smart Categories</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Organize timers by Pinned (urgent), General (work), Personal (life), and Custom (anything). 
                Your brain processes different types of deadlines differently - so should your app.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-900">Past & Future</h3>
              <p className="text-green-800 text-sm leading-relaxed">
                Expired timers don't disappear - they become "Days Passed" counters. Perfect for tracking 
                anniversaries, milestones, or celebrating how far you've come.
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-900">Sync Everywhere</h3>
              <p className="text-purple-800 text-sm leading-relaxed">
                Sign in to sync your timers across all devices. Anonymous? No problem - everything works 
                offline with local storage until you're ready to create an account.
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-orange-900">Focus Tools</h3>
              <p className="text-orange-800 text-sm leading-relaxed">
                Pin only your most urgent timers. Search through hundreds. Hide completed ones. 
                Tools that help you focus on what matters right now.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Philosophy */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Built Right</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Privacy First</h3>
              <p className="text-gray-600">
                No tracking, no analytics, no data mining. Your timers are yours. Period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Fast & Reliable</h3>
              <p className="text-gray-600">
                Real-time updates, offline support, and lightning-fast performance. Works when you need it.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Simple by Design</h3>
              <p className="text-gray-600">
                No feature bloat. No confusing settings. Just timers that work exactly as you'd expect.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Work & Career</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Project deadlines and milestones</li>
                <li>• Conference submissions</li>
                <li>• Performance reviews</li>
                <li>• Tax filing deadlines</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Personal Life</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Birthdays and anniversaries</li>
                <li>• Vacation planning</li>
                <li>• Fitness goals and challenges</li>
                <li>• Important appointments</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Ready to Take Control of Time?</h2>
          <p className="text-gray-600 mb-6">Join thousands who've made time work for them, not against them.</p>
          <Link
            href="/#custom"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your First Timer
          </Link>
        </section>

        {/* AdSense for content-rich about page */}
        <div className="mt-12">
          <AdSenseComponent 
            className="flex justify-center"
            adFormat="auto"
            pageType="content"
          />
        </div>
      </div>
    </main>
  );
} 