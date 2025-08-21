import type { Metadata } from 'next'
import Script from 'next/script'
import HomePage from "../components/HomePage"

export const metadata: Metadata = {
  title: "Now & Then — Smart Countdown & Deadline Tracker",
  description: "Set countdowns, track deadlines and milestones. Beautiful UI, sync across devices, and flexible templates.",
  alternates: { canonical: "/" },
}

export default function Page() {
  return (
    <>
      <Script id="ld-software" type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Now & Then",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        description: "Countdown and deadline tracker with sync and templates.",
        url: "/",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      })}</Script>
      <Script id="ld-website" type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Now & Then",
        url: "/",
        potentialAction: { "@type": "SearchAction", target: "/templates?query={search_term_string}", "query-input": "required name=search_term_string" }
      })}</Script>
      <HomePage />
    </>
  )
}
