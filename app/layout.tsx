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
  title: "Now & Then",
  description: "Track important dates with customizable countdown cards",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
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
      </head>
      <body className={`${merriweather.variable}`}>{children}</body>
    </html>
  )
}

