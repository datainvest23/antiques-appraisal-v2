import { Metadata } from "next"
import ResourcesGrid from "@/components/resources-grid"

// Define our resources data
const resources = [
  {
    id: "unlocking-antique-values",
    title: "Unlocking Antique Values: How AI Revolutionizes Appraisals",
    description: "Discover how artificial intelligence is transforming the world of antique valuation with data-driven insights while complementing expert human judgment.",
    image: "/1-Unlocking-Antique-Values.png",
    date: "April 1, 2025",
    readTime: "6 min read"
  },
  {
    id: "navigating-valuation-standards",
    title: "Navigating International Valuation Standards for Antique Collectors",
    description: "Learn how international valuation standards ensure consistency and transparency in antique appraisals, and how collectors can effectively navigate these guidelines.",
    image: "/2-Navigating-Valuation-Standards.png",
    date: "April 2, 2025",
    readTime: "5 min read"
  },
  {
    id: "identifying-hidden-gems",
    title: "Identifying Hidden Gems: Expert Tips for Spotting Valuable Antiques",
    description: "Learn expert techniques for identifying valuable antiques with our comprehensive guide on key indicators, common pitfalls, and leveraging technology for accurate identification.",
    image: "/3-Identifying-Hidden-Gems.png",
    date: "April 3, 2025",
    readTime: "7 min read"
  }
  // More resources can be added here
]

export const metadata: Metadata = {
  title: "Antique Appraisal Resources | Expert Guides & Insights",
  description: "Explore our collection of expert guides, market trends, and insights on antique valuation, authentication, and collecting strategies.",
  openGraph: {
    title: "Antique Appraisal Resources | Expert Guides & Insights",
    description: "Explore our collection of expert guides, market trends, and insights on antique valuation, authentication, and collecting strategies."
  }
}

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Antique Appraisal Resources: Expert Guides & Valuation Insights</h1>
        <h2 className="text-2xl text-muted-foreground max-w-3xl mx-auto">
          Expert guides, market insights, and educational content to help you understand, 
          identify, and value your antique treasures.
        </h2>
      </div>
      
      <ResourcesGrid resources={resources} />
    </div>
  )
} 