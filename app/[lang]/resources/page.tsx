import ResourcesClient from "./resources-client"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Antique Appraisal Resources | Expert Guides & Insights",
  description: "Explore our collection of expert guides, market trends, and insights on antique valuation, authentication, and collecting strategies.",
  openGraph: {
    title: "Antique Appraisal Resources | Expert Guides & Insights",
    description: "Explore our collection of expert guides, market trends, and insights on antique valuation, authentication, and collecting strategies."
  }
}

export default async function ResourcesPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <ResourcesClient dictionary={dictionary} />
}
