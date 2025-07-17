import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
}

const blogPosts: Record<string, BlogPost> = {
  "mastering-deadline-management": {
    id: "mastering-deadline-management",
    title: "Mastering Deadline Management: A Complete Guide",
    excerpt: "Learn proven strategies to track deadlines effectively and never miss important dates again. Essential techniques for professionals and students.",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Productivity",
    author: "Now & Then Team",
    content: `
# Deadline Management Tips

Missing deadlines can hurt your success. Here are simple strategies to stay on track.

## Set Clear Deadlines

Use the SMART framework:
- **Specific**: Clear outcomes
- **Measurable**: Track progress  
- **Achievable**: Realistic goals
- **Relevant**: Important to you
- **Time-bound**: Fixed dates

## Visual Countdown Benefits

Countdown timers help by:
- Creating urgency
- Showing progress
- Reducing procrastination  
- Improving focus

## Organization Tips

**Three Time Horizons:**
1. **Immediate (0-2 weeks)**: Daily tasks
2. **Short-term (2 weeks-3 months)**: Projects  
3. **Long-term (3+ months)**: Major goals

**Common Mistakes:**
- Underestimating time needed
- Taking on too much
- Poor prioritization

## Tools That Help

- Visual countdown timers
- Calendar integration
- Regular reviews
- Buffer time for delays

## Getting Started

1. List your current deadlines
2. Set up countdown timers
3. Review weekly
4. Adjust as needed

Start with one important deadline and build from there.
    `
  },
  
  "psychology-of-countdown-timers": {
    id: "psychology-of-countdown-timers",
    title: "Why Countdown Timers Work",
    excerpt: "The psychology behind countdown timers and motivation.",
    date: "2024-01-12",
    readTime: "2 min read",
    category: "Psychology",
    author: "Now & Then Team",
    content: `
# Why Countdown Timers Work

Countdown timers are powerful motivation tools. Here's why they're so effective.

## Brain Science

Your brain responds to time pressure by:
- Releasing dopamine (motivation chemical)
- Filtering out distractions
- Enhancing focus and memory
- Creating healthy stress

## The Scarcity Effect

Limited time makes things feel more valuable. Countdown timers:
- Capture attention
- Speed up decisions
- Reduce procrastination
- Increase perceived importance

## Visual Power

Your brain processes visuals faster than text. Effective countdown timers use:
- **Colors**: Red for urgency, green for progress
- **Movement**: Changing numbers hold attention
- **Size**: Bigger timers feel more urgent
- **Precision**: Exact times (23:42:15) feel more real

## Best Practices

**For Focus:**
- Use 25-minute work sessions (Pomodoro)
- Take breaks between timed periods
- Match timer length to task complexity

**For Goals:**
- Set realistic deadlines
- Use visual progress tracking
- Celebrate when timers reach zero

## Potential Problems

Be careful not to:
- Use timers constantly (causes stress)
- Set impossible deadlines
- Become addicted to urgency
- Sacrifice quality for speed

## Getting Started

1. Choose one task
2. Set a reasonable timer
3. Focus until it ends
4. Take a break
5. Repeat as needed

The key is balance - use timers to motivate, not stress yourself out.
    `
  },
  
  "goal-setting-with-visual-timers": {
    id: "goal-setting-with-visual-timers",
    title: "Visual Goal Setting",
    excerpt: "Use visual timers to achieve goals faster.",
    date: "2024-01-10",
    readTime: "3 min read",
    category: "Goal Setting",
    author: "Now & Then Team",
    content: `
# Visual Goal Setting

Visual timers make goals more achievable. Here's how to use them effectively.

## Why Visual Goals Work

Research shows visual progress tracking:
- Increases goal completion by 42%
- Reduces procrastination by 35%
- Maintains motivation longer
- Makes progress feel real

## SMART-V Goals

Enhance traditional SMART goals with Visual elements:
- **Specific**: Clear outcomes
- **Measurable**: Track progress
- **Achievable**: Realistic targets
- **Relevant**: Important to you
- **Time-bound**: Fixed deadlines
- **Visual**: Use countdown timers

## Types of Visual Timers

**1. Countdown Timers**
- Project deadlines
- Event preparation
- Exam dates

**2. Count-Up Timers**
- Habit streaks
- Learning progress
- Fitness routines

**3. Milestone Timers**
- Career goals
- Large projects
- Personal development

## Color Psychology

Choose colors that motivate:
- **Red**: Urgent deadlines (use sparingly)
- **Green**: Progress and growth
- **Blue**: Long-term professional goals
- **Yellow**: Creative projects

## Implementation

**Daily:**
- Check progress each morning
- Update timers as needed
- Celebrate small wins

**Weekly:**
- Review all active goals
- Adjust timelines if necessary
- Add new timers for upcoming goals

## Common Mistakes

Avoid these problems:
- Too many timers at once (limit to 3-5)
- Unrealistic deadlines
- Ignoring visual updates
- All-or-nothing thinking

## Getting Started

1. Pick one important goal
2. Set a clear deadline
3. Create a visual timer
4. Check progress daily
5. Adjust as you learn

Visual goal tracking transforms vague wishes into concrete action plans.
    `
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
  
  if (!post) {
    return {
      title: "Post Not Found | Now & Then Blog",
      description: "The requested blog post could not be found."
    };
  }

  return {
    title: `${post.title} | Now & Then Blog`,
    description: post.excerpt,
    keywords: `${post.category.toLowerCase()}, time management, productivity, goal setting, countdown timer`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  // Convert markdown-style content to HTML-like JSX
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mb-6 mt-8">{paragraph.slice(2)}</h1>;
        }
        if (paragraph.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mb-4 mt-6">{paragraph.slice(3)}</h2>;
        }
        if (paragraph.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium mb-3 mt-4">{paragraph.slice(4)}</h3>;
        }
        if (paragraph.startsWith('#### ')) {
          return <h4 key={index} className="text-lg font-medium mb-2 mt-3">{paragraph.slice(5)}</h4>;
        }
        if (paragraph.startsWith('- ')) {
          return <li key={index} className="mb-1">{paragraph.slice(2)}</li>;
        }
        if (paragraph.match(/^\d+\. /)) {
          return <li key={index} className="mb-1">{paragraph.replace(/^\d+\. /, '')}</li>;
        }
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return <strong key={index} className="font-semibold block mb-2">{paragraph.slice(2, -2)}</strong>;
        }
        if (paragraph.trim() === '') {
          return <div key={index} className="mb-4"></div>;
        }
        return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
      });
  };

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/blog" className="inline-block mb-4 text-sm text-gray-500 hover:underline">
          ← Back to Blog
        </Link>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {post.category}
          </span>
          <span className="text-sm text-gray-500">{post.readTime}</span>
          <span className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 text-lg mb-6">{post.excerpt}</p>
        <div className="text-sm text-gray-500 mb-8">By {post.author}</div>
      </div>

      <article className="prose prose-lg max-w-none">
        <div className="text-gray-800 leading-relaxed">
          {formatContent(post.content)}
        </div>
      </article>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Ready to Put This Into Practice?</h3>
        <p className="text-gray-600 mb-6">
          Start implementing these time management strategies with our countdown timer tool.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/"
            className="inline-block bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Try Now & Then →
          </Link>
          <Link 
            href="/blog"
            className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Read More Articles
          </Link>
        </div>
      </div>
    </main>
  );
}