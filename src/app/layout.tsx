import type { Metadata } from "next"
import { Geist, Lobster } from "next/font/google"
import { Cinzel } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin"],
  weight: ["400"],
})

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600"],
})

export const metadata: Metadata = {
  title: "NextChoice",
  description: "과거 결정을 기반으로 더 나은 선택을",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${geist.variable} ${cinzel.variable} ${lobster.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
