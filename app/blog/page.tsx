import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Now & Then",
  description: "In-depth articles on time management, productivity, and making deadlines work for you.",
  keywords: "time management blog, productivity articles, deadline psychology, countdown timers",
};

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  publishedAt: string;
}

const blogArticles: BlogArticle[] = [
  {
    id: "1",
    title: "The Neuroscience of Deadlines: Why Your Brain Loves Countdown Pressure",
    excerpt: "Discover the fascinating brain chemistry behind why deadlines motivate us, and how to harness this ancient survival mechanism for modern productivity.",
    content: `Ever wonder why you suddenly become a productivity machine as a deadline approaches? There's actual neuroscience behind this phenomenon, and understanding it can transform how you approach time management.

**The Threat Detection System**

Your brain evolved over millions of years to keep you alive in dangerous environments. When it perceives a threat, it triggers a cascade of neurochemical responses that sharpen focus, boost energy, and accelerate decision-making. Here's the fascinating part: your brain treats approaching deadlines exactly like physical threats.

When you see "3 days remaining," your amygdala (the brain's alarm system) interprets this as urgency. Stress hormones like cortisol and adrenaline flood your system, while dopamine pathways light up in anticipation of completing the task. This isn't procrastination - it's biology.

**The Sweet Spot of Pressure**

Psychologists call this the "optimal anxiety zone" or Yerkes-Dodson law. Too little pressure, and you lack motivation. Too much, and you freeze up. The magic happens in the middle - enough urgency to engage your brain's high-performance mode without overwhelming it.

Traditional to-do lists fail because they lack this pressure element. "Call dentist" sitting on a list for weeks doesn't trigger your threat detection system. But "Call dentist - 2 days until coverage expires" suddenly becomes urgent.

**Hacking the System**

Smart deadline management isn't about last-minute panic. It's about creating artificial urgency that keeps you in that optimal zone:

• Break large projects into milestone deadlines
• Set "buffer deadlines" 2-3 days before the real due date  
• Use visual countdowns (like Now & Then) to maintain awareness
• Create accountability by sharing deadlines with others

**The Dopamine Reward Loop**

Here's another brain hack: your dopamine system releases feel-good chemicals not just when you complete tasks, but when you make progress toward deadlines. Watching a countdown decrease from 10 days to 9 days gives you a micro-hit of satisfaction that reinforces the behavior.

This is why effective time management isn't about eliminating stress - it's about using your brain's natural systems to create sustainable motivation. When you work with your neurology instead of against it, productivity becomes almost effortless.`,
    category: "Psychology",
    readTime: "5 min read",
    publishedAt: "2024-01-20"
  },
  {
    id: "2", 
    title: "From Chaos to Clarity: A Developer's Journey to Time Management Mastery",
    excerpt: "How overwhelming deadlines taught me the difference between being busy and being productive, and the simple system that changed everything.",
    content: `Two years ago, I was drowning. Juggling 15+ projects, missing deadlines, and working 70-hour weeks while somehow accomplishing less than ever. Sound familiar?

**The Breaking Point**

The wake-up call came during a particularly brutal sprint. I had five major deliverables due within two weeks, three client calls scheduled, and a growing pile of "urgent" tasks that weren't really urgent at all. I was the picture of someone who looked incredibly busy but was actually just incredibly scattered.

That's when I discovered something that seems obvious in hindsight: being aware of time and managing time are completely different skills.

**The Awareness Problem**

Most of us are terrible at time awareness. We think in vague terms like "next week" or "soon" or "before the deadline." But your brain needs specificity to prioritize effectively. 

I started an experiment: instead of checking my calendar or to-do app, I created visual countdowns for everything important. Not just work deadlines, but personal commitments, bill due dates, even social events I was looking forward to.

**The Transformation**

Within a month, something remarkable happened. My brain started naturally prioritizing based on temporal proximity. Tasks with 2-day countdowns automatically felt more urgent than those with 10-day countdowns. I stopped feeling overwhelmed by long lists and started feeling motivated by approaching deadlines.

But the real breakthrough was psychological. Instead of viewing deadlines as external pressures imposed by others, I began seeing them as valuable constraints that helped me focus. Constraints aren't limitations - they're clarification.

**The Simple System**

Here's the exact system I use now:

1. **Everything gets a countdown** - If it matters, it gets a timer. Work projects, personal goals, even fun stuff like concert dates.

2. **Categories create clarity** - Work stuff stays in General, personal life goes in Personal, and urgent items get pinned. Your brain processes different types of deadlines differently.

3. **The 3-5-7 rule** - Never pin more than 3 items, keep no more than 5 active projects, and review everything weekly (every 7 days).

4. **Buffer zone strategy** - Set personal deadlines 2-3 days before external ones. When your timer hits zero, you still have breathing room.

**The Unexpected Benefits**

What surprised me most wasn't the increased productivity - it was the decreased anxiety. When you can see exactly how much time you have, your brain stops wasting energy on vague worry and channels it into focused action instead.

I also discovered that time-boxing works better with countdowns than calendars. "Finish proposal by Friday" is abstract. "Finish proposal in 3 days" creates urgency.

**For Fellow Skeptics**

If you're thinking "I don't need another productivity system," I get it. I tried them all - GTD, bullet journaling, Pomodoro, you name it. This isn't another system. It's just making time visible.

Your brain already knows how to prioritize when it has clear information. Give it that information, and watch what happens.`,
    category: "Personal Story",
    readTime: "6 min read", 
    publishedAt: "2024-01-15"
  },
  {
    id: "3",
    title: "The Architecture of Urgency: How Top Performers Design Their Deadlines",
    excerpt: "Elite athletes, successful entrepreneurs, and creative professionals all share one trait: they create artificial urgency. Here's how they do it.",
    content: `What do Olympic athletes, startup founders, and bestselling authors have in common? They're all masters at creating artificial urgency around their most important work.

**The Professional Paradox**

Here's something counterintuitive: the most successful people often have the most self-imposed deadlines. You'd think success would mean fewer constraints and more freedom. Instead, top performers deliberately create pressure where none existed.

Why? Because they understand that constraints drive creativity and urgency drives action.

**Case Study: The 24-Hour Startup**

In the startup world, there's a famous exercise called "build a business in 24 hours." Entrepreneurs take a business idea and force themselves to launch it - website, product, first customer - within a single day.

The results are remarkable. Ideas that might have taken months to develop get executed in hours. Features that seemed essential get stripped away, revealing the core value proposition. Analysis paralysis disappears when you only have 24 hours to act.

This isn't about cutting corners. It's about the focusing power of artificial urgency.

**The Creative Constraint**

Writers use similar techniques. Stephen King gives himself daily word count targets. Maya Angelou rented a hotel room with nothing but a Bible, a thesaurus, and yellow legal pads - then forced herself to write there every morning.

These aren't external deadlines imposed by publishers. They're self-created constraints that channel creative energy into productive output.

**The Athlete's Mindset**

Olympic training schedules are fascinating studies in deadline design. Athletes don't just train toward the Olympics (4 years away). They create competitions, time trials, and performance benchmarks that happen weekly or monthly.

Each micro-deadline serves as both motivation and measurement. Miss a training deadline, and you know you're off track for the big goal. Hit it, and you get a dopamine boost that carries momentum forward.

**Designing Your Deadline Architecture**

Here's how to apply these principles to any goal:

**1. Nested Deadlines**
Instead of one big deadline, create a series of smaller ones leading up to it. Writing a book? Set chapter deadlines. Launching a product? Set feature completion deadlines.

**2. Public Accountability**
Share your deadlines with others. Social pressure is one of the strongest motivators humans have. Tell your team, your friends, your social media followers.

**3. Stakes and Rewards**
Attach consequences to your deadlines. Miss one, and you owe money to charity. Hit one, and you get a reward. Make the stakes meaningful enough to motivate but not so severe they create paralyzing fear.

**4. Forcing Functions**
Create situations where you have no choice but to deliver by the deadline. Book the conference presentation before you've written the talk. Schedule the client demo before the feature is complete.

**The 80/20 of Deadline Design**

After studying hundreds of high performers, I've found they all follow one principle: 20% of their deadlines are external (imposed by others), while 80% are internal (self-created).

Most people have this backwards. They wait for external pressure to drive action, then wonder why they lack motivation for personal projects or long-term goals.

**The Implementation Strategy**

Start small. Pick one important goal and add three artificial deadlines:
- A planning deadline (when you'll finish strategizing)
- A progress deadline (when you'll complete 50%)  
- A buffer deadline (2-3 days before the real deadline)

Use visual countdowns to maintain awareness. Your brain needs to see time passing to feel urgency building.

**The Meta-Skill**

Learning to design effective deadlines is actually learning to design effective motivation. It's the meta-skill that makes every other skill more achievable.

Because here's the truth: motivation isn't something that happens to you. It's something you architect.`,
    category: "Strategy",
    readTime: "7 min read",
    publishedAt: "2024-01-10"
  }
];

export default function Blog() {
  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back
      </Link>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Time & Productivity Insights</h1>
        <p className="text-xl text-gray-600">Deep dives into the psychology and strategy of effective time management.</p>
      </div>

      <div className="space-y-8">
        {blogArticles.map((article) => (
          <article key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{article.category}</span>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <time>{article.publishedAt}</time>
                  <span>{article.readTime}</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {article.title}
              </h2>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {article.excerpt}
              </p>
              
              <div className="prose prose-gray max-w-none text-sm leading-relaxed text-gray-700">
                {article.content.split('\n\n').slice(0, 3).map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph.startsWith('**') ? (
                      <strong className="font-semibold text-gray-900">
                        {paragraph.replace(/\*\*/g, '')}
                      </strong>
                    ) : paragraph.startsWith('•') ? (
                      <span className="block ml-4">{paragraph}</span>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
                <div className="text-gray-400 text-xs mt-4">
                  {article.content.split('\n\n').length > 3 && "Continue reading below..."}
                </div>
              </div>
              
              {/* Full content in collapsed state for now - could be expanded with JavaScript */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                  Read full article
                </summary>
                <div className="mt-4 prose prose-gray max-w-none text-sm leading-relaxed text-gray-700">
                  {article.content.split('\n\n').slice(3).map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph.startsWith('**') ? (
                        <strong className="font-semibold text-gray-900">
                          {paragraph.replace(/\*\*/g, '')}
                        </strong>
                      ) : paragraph.startsWith('•') ? (
                        <span className="block ml-4">{paragraph}</span>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}