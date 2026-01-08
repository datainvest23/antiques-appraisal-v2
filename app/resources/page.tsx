import { Metadata } from "next"
import ResourcesPageContent from "@/components/resources-page-content"

export const metadata: Metadata = {
  title: "Antique Appraisal Resources | Expert Guides & Insights",
  description: "Explore our collection of expert guides, market trends, and insights on antique valuation, authentication, and collecting strategies.",
  openGraph: {
    title: "Antique Appraisal Resources | Expert Guides & Insights",
    description: "Explore our collection of expert guides, market trends, and insights on antique valuation, authentication, and collecting strategies."
  }
}

export default function ResourcesPage() {
  return <ResourcesPageContent />
} 
