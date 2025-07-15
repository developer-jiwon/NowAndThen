import type React from "react"
import type { Metadata } from "next"
import { Merriweather } from "next/font/google"
import "./globals.css"
import dynamic from "next/dynamic"
import SupabaseProvider from "@/components/SupabaseProvider"
// import Script from "next/script"; // 더 이상 사용하지 않음

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
})

export const metadata: Metadata = {
  title: "Now & Then",
  description: "Track important dates with customizable countdown cards",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
}

const LoginButton = dynamic(() => import("@/components/login-button"), { ssr: false })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" sizes="any" />
        {/* 애드센스 광고 스크립트 제거됨 */}
      </head>
      <body className={`${merriweather.variable}`}>
        <SupabaseProvider>
          <div className="relative min-h-screen">
            {children}
          </div>
          <footer className="w-full border-t border-gray-100 py-2 mt-2 bg-white text-center text-[11px] text-gray-500">
            <div className="mb-0">Track your important moments with Now & Then.</div>
            <div className="flex flex-nowrap justify-center gap-x-1 gap-y-0">
              <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
              <span className="text-gray-300">|</span>
              <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
              <span className="text-gray-300">|</span>
              <a href="/cookie-policy" className="hover:underline">Cookie Policy</a>
              <span className="text-gray-300">|</span>
              Contact: <a href="mailto:dev.jiwonnie@gmail.com" className="hover:underline break-all">dev.jiwonnie@gmail.com</a>
            </div>
          </footer>
        </SupabaseProvider>
      </body>
    </html>
  )
}

