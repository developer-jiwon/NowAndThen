import type React from "react"
import type { Metadata } from "next"
import { Merriweather } from "next/font/google"
import "./globals.css"
import SupabaseProvider from "@/components/SupabaseProvider"

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
})

export const metadata: Metadata = {
  title: "Now & Then - Countdown Timer & Deadline Tracker",
  description: "Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines. Boost productivity with proven time management strategies.",
  keywords: "countdown timer, deadline tracker, time management, productivity, goal setting, project management, countdown app, timer tool, productivity app, time tracking, deadline management",
  authors: [{ name: "Now & Then Team" }],
  creator: "Now & Then",
  publisher: "Now & Then",
  metadataBase: new URL('https://nowandthen.app'),
  alternates: {
    canonical: 'https://nowandthen.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nowandthen.app',
    title: 'Now & Then - Countdown Timer & Deadline Tracker',
    description: 'Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines.',
    siteName: 'Now & Then',
    images: [
      {
        url: '/favicon.svg',
        width: 1200,
        height: 630,
        alt: 'Now & Then - Countdown Timer App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Now & Then - Countdown Timer & Deadline Tracker',
    description: 'Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines.',
    creator: '@nowandthenapp',
    images: ['/favicon.svg'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg' },
    ],
  },
  category: 'productivity',
  classification: 'productivity app',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" sizes="any" />
        <link rel="canonical" href="https://nowandthen.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="application-name" content="Now & Then" />
        <meta name="description" content="Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines. Boost productivity with proven time management strategies." />
        
        {/* Google Search Console Verification - Replace with your actual verification code */}
        <meta name="google-site-verification" content="YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE" />
        
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
        
        {/* Structured Data for AdSense */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Now & Then",
              "description": "Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines.",
              "url": "https://nowandthen.app",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "1.0",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Now & Then Team",
                "url": "https://nowandthen.app",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "dev.jiwonnie@gmail.com",
                  "contactType": "Customer Service"
                }
              },
              "featureList": [
                "Countdown timers",
                "Deadline tracking", 
                "Goal management",
                "Cross-device sync",
                "Timer categories",
                "Progress tracking"
              ]
            })
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Now & Then",
              "url": "https://nowandthen.app",
              "logo": "https://nowandthen.app/favicon.svg",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "dev.jiwonnie@gmail.com",
                "contactType": "Customer Service"
              },
              "sameAs": [
                "https://nowandthen.app"
              ]
            })
          }}
        />
        
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Do I need to sign in?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No, but signing in syncs your timers across devices."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "Is my data private?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Local storage for anonymous use, encrypted cloud for signed-in users."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What's the difference between categories?",
                  "acceptedAnswer": {
                    "@type": "Answer", 
                    "text": "Pinned for urgent deadlines, General for work tasks, Personal for life events, Custom for anything else."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${merriweather.variable} flex flex-col`}>
        <SupabaseProvider>
          <div className="relative flex flex-col">
            {children}
          </div>
          <footer className="w-full border-t border-gray-100 pt-3 pb-1 mt-0 bg-white text-center text-[11px] text-gray-500">
            <div className="mb-2">Track your important moments with Now & Then.</div>
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
              <div className="flex flex-row flex-wrap justify-center gap-x-2 w-full mb-2">
                <a href="/about" className="hover:underline">About</a>
                <span className="text-gray-300">|</span>
                <a href="/guide" className="hover:underline">Guide</a>
                <span className="text-gray-300">|</span>
                <a href="/blog" className="hover:underline">Blog</a>
                <span className="text-gray-300">|</span>
                <a href="/templates" className="hover:underline">Templates</a>
                <span className="text-gray-300">|</span>
                <a href="/faq" className="hover:underline">FAQ</a>
                <span className="text-gray-300">|</span>
                <a href="/contact" className="hover:underline">Contact</a>
              </div>
              <div className="flex flex-row flex-wrap justify-center gap-x-2 w-full mb-2">
                <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
                <span className="text-gray-300">|</span>
                <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
                <span className="text-gray-300">|</span>
                <a href="/cookie-policy" className="hover:underline">Cookie Policy</a>
              </div>
              <span className="break-all mt-1">Contact: <a href="mailto:dev.jiwonnie@gmail.com" className="hover:underline break-all">dev.jiwonnie@gmail.com</a></span>
            </div>
          </footer>
        </SupabaseProvider>
      </body>
    </html>
  )
}

