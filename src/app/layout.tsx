import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
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
    <html lang="ko" className={`${geist.variable} ${cormorant.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
