import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Cinzel } from "next/font/google"
import "./globals.css"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="ko" className={`${geist.variable} ${cinzel.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
