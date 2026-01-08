import type React from "react"
import { Inter } from "next/font/google"
import "../globals.css" // Updated import path
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Analytics } from '@vercel/analytics/react'
import { i18n, type Locale } from "@/i18n-config"
import { getDictionary } from "@/lib/get-dictionary"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Antiques Appraisal",
  description: "AI-powered antique valuation and appraisal service",
  generator: 'v0.dev'
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <Navbar lang={lang} dictionary={dictionary.Navbar} />
              <div className="flex-1">{children}</div>
              <Footer dictionary={dictionary.Footer} />
            </div>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
