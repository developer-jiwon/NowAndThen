import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Merriweather } from "next/font/google"
import "./globals.css"
import SupabaseProvider from "@/components/SupabaseProvider"
import ConsentBanner from "@/components/ConsentBanner"

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
})

// Resolve site URL from environment to avoid hardcoding
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.now-then.dev'
const siteUrl = rawSiteUrl.endsWith('/') ? rawSiteUrl.slice(0, -1) : rawSiteUrl

export const metadata: Metadata = {
  title: "Now & Then - Countdown Timer & Deadline Tracker",
  description: "Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines. Boost productivity with proven time management strategies.",
  keywords: "countdown timer, deadline tracker, time management, productivity, goal setting, project management, countdown app, timer tool, productivity app, time tracking, deadline management",
  authors: [{ name: "Now & Then Team" }],
  creator: "Now & Then",
  publisher: "Now & Then",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
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
    url: siteUrl,
    title: 'Now & Then - Countdown Timer & Deadline Tracker',
    description: 'Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines.',
    siteName: 'Now & Then',
    images: [
      {
        // Use dynamic OG with version to avoid stale caches on Discord/Twitter
        url: `${siteUrl}/api/og?v=4`,
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
  },
  icons: {
    icon: [
      { url: '/icons/nowandthen-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      // Add cache-busting query to avoid stale iOS cached icon
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180' },
      // Provide multiple declared sizes (iOS will pick best; all point to same asset)
      { url: '/apple-touch-icon.png?v=2', sizes: '120x120' },
      { url: '/apple-touch-icon.png?v=2', sizes: '152x152' },
      { url: '/apple-touch-icon.png?v=2', sizes: '167x167' },
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
        <link rel="icon" type="image/svg+xml" href="/icons/nowandthen-icon.svg" sizes="any" />
        {/* iOS A2HS icons. Provide plain path first (some iOS versions ignore querystrings). */}
        {/* Serve real static PNGs */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href={siteUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="application-name" content="Now & Then" />
        <meta name="description" content="Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines. Boost productivity with proven time management strategies." />
        
        
        {/* Google Search Console Verification - Replace with your actual verification code */}
        <meta name="google-site-verification" content="ELL-x5tIpqAhOb58cy_wsdVCh6csVzbl_VJt1pgOotM" />
        {/* Hide LaunchDarkly logs in development */}
        {process.env.NODE_ENV === 'development' && (
          <Script id="hide-launchdarkly-logs" strategy="beforeInteractive">{
            `
            (function() {
              const originalLog = console.log;
              const originalWarn = console.warn;
              const originalError = console.error;
              
              const shouldFilter = (args) => {
                return args.some(arg => 
                  typeof arg === 'string' && (
                    arg.includes('LaunchDarkly') || 
                    arg.includes('clientstream.launchdarkly.com') ||
                    arg.includes('apple-mobile-web-app-capable') ||
                    arg.includes('mobile-web-app-capable')
                  )
                );
              };
              
              console.log = function(...args) {
                if (shouldFilter(args)) return;
                originalLog.apply(console, args);
              };
              console.warn = function(...args) {
                if (shouldFilter(args)) return;
                originalWarn.apply(console, args);
              };
              console.error = function(...args) {
                if (shouldFilter(args)) return;
                originalError.apply(console, args);
              };
            })();
            `
          }</Script>
        )}

        {/* Removed global "denied" default; AdSense CMP will manage consent in EEA/UK. */}

        {/* Google Analytics 4 (optional via env) */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{
              `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `
            }</Script>
          </>
        ) : null}

        {/* Google AdSense global script (present for pre-approval; ad slots gated elsewhere) */}
        <Script
          id="adsense-global"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-4588308927468413'}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* WebApplication Schema (site-wide) */}
        <Script id="ld-webapp" type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Now & Then",
          description: "Professional countdown timer and deadline tracking tool. Create beautiful timers for goals, events, and deadlines.",
          url: siteUrl,
          applicationCategory: "ProductivityApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript. Requires HTML5.",
          softwareVersion: "1.0",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          creator: {
            "@type": "Organization",
            name: "Now & Then Team",
            url: siteUrl,
            contactPoint: { "@type": "ContactPoint", email: "dev.jiwonnie@gmail.com", contactType: "Customer Service" }
          },
          featureList: [
            "Countdown timers",
            "Deadline tracking",
            "Goal management",
            "Cross-device sync",
            "Timer categories",
            "Progress tracking"
          ]
        })}</Script>

        {/* Organization Schema */}
        <Script id="ld-org" type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Now & Then",
          url: siteUrl,
          logo: `${siteUrl}/favicon.svg`,
          contactPoint: { "@type": "ContactPoint", email: "dev.jiwonnie@gmail.com", contactType: "Customer Service" },
          sameAs: [siteUrl]
        })}</Script>
      </head>
      <body className={`${merriweather.variable} flex flex-col`}> 
        <SupabaseProvider>
          <ConsentBanner />
          <Script id="sw-register" strategy="afterInteractive">{`
            if ('serviceWorker' in navigator) {
              (async () => {
                try {
                  const params = new URLSearchParams(location.search);
                  const disableSW = params.get('nosw') === '1';
                  if (disableSW) {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(regs.map(r => r.unregister()));
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      await Promise.all(keys.map(k => caches.delete(k)));
                    }
                    console.log('[SW] Disabled for session via ?nosw=1');
                    return;
                  }
                  // 1) 기존에 unified가 아닌 SW 정리
                  const regs = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(
                    regs.map(r => {
                      const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '';
                      if (!url.includes('/sw-unified.js')) {
                        return r.unregister();
                      }
                      return Promise.resolve(true);
                    })
                  );

                  // 2) 버전 캐시버스트로 강제 업데이트
                  const swUrl = '/sw-unified.js?v=8';
                  const existing = await navigator.serviceWorker.getRegistration();
                  if (!existing || !(existing.active?.scriptURL || '').includes(swUrl)) {
                    await navigator.serviceWorker.register(swUrl, { scope: '/', updateViaCache: 'none' });
                  } else {
                    existing.update();
                  }

                  await navigator.serviceWorker.ready;
                  if (typeof window !== 'undefined') {
                    const vapidKey = 'BAh0YkNpMzFaTleGijr-4mvzLp3TA7-3E_V225OS1L-JJHWMO_eYcFH8o3wD6SxHGnwobqXwSdta4zXTzQDro6s';
                    window.NEXT_PUBLIC_VAPID_PUBLIC_KEY = vapidKey;
                    if (window.webPushManager) window.webPushManager.setVapidKey(vapidKey);
                  }
                } catch (e) {
                  console.error('SW register error', e);
                }
              })();
            }

            // PWA Install Prompt Handler
            window.deferredPrompt = null;
            
            window.addEventListener('beforeinstallprompt', (e) => {
              // Prevent Chrome 67 and earlier from automatically showing the prompt
              e.preventDefault();
              // Stash the event so it can be triggered later
              window.deferredPrompt = e;
              
              // Store the prompt for later use (don't auto-show)
              console.log('PWA install prompt available');
              
              // Dispatch custom event to notify components
              window.dispatchEvent(new CustomEvent('pwa-installable'));
            });

            // Handle successful installation
            window.addEventListener('appinstalled', (evt) => {
              console.log('PWA was installed');
              window.deferredPrompt = null;
              
              // Dispatch custom event to notify components
              window.dispatchEvent(new CustomEvent('pwa-installed'));
            });

            // Make install function globally available
            window.installPWA = () => {
              console.log('Global installPWA called, deferredPrompt:', !!window.deferredPrompt);
              if (window.deferredPrompt) {
                const prompt = window.deferredPrompt;
                prompt.prompt();
                
                prompt.userChoice.then((choiceResult) => {
                  console.log('Install prompt result:', choiceResult.outcome);
                  if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    window.dispatchEvent(new CustomEvent('pwa-installed'));
                  } else {
                    console.log('User dismissed the install prompt');
                  }
                  window.deferredPrompt = null;
                });
                return true;
              } else {
                console.log('PWA install prompt not available');
                return false;
              }
            };
          `}</Script>
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

