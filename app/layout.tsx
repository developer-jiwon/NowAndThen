import type React from "react"
import type { Metadata } from "next"
import { Merriweather } from "next/font/google"
import "./globals.css"

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
})

export const metadata: Metadata = {
  title: "Countdown Cards",
  description: "Track important dates with customizable countdown cards",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${merriweather.variable}`}>{children}</body>
    </html>
  )
}

