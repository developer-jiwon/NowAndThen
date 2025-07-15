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
          <footer className="w-full border-t border-gray-100 py-6 mt-12 bg-white text-center text-sm text-gray-500">
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <span className="mx-2 text-gray-300">|</span>
            <a href="/cookie-policy" className="hover:underline">Cookie Policy</a>
          </footer>
        </SupabaseProvider>
      </body>
    </html>
  )
}

