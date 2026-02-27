import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define featured resources - now featuring all 3 resources
const featuredResources = [
  {
    id: "unlocking-antique-values",
    title: "Unlocking Antique Values: How AI Revolutionizes Appraisals",
    description: "Discover how artificial intelligence is transforming the world of antique valuation with data-driven insights while complementing expert human judgment.",
    image: "/1-Unlocking-Antique-Values.png",
    readTime: "6 min read"
  },
  {
    id: "navigating-valuation-standards",
    title: "Navigating International Valuation Standards for Antique Collectors",
    description: "Learn how international valuation standards ensure consistency and transparency in antique appraisals, and how collectors can effectively navigate these guidelines.",
    image: "/2-Navigating-Valuation-Standards.png",
    readTime: "5 min read"
  },
  {
    id: "identifying-hidden-gems",
    title: "Identifying Hidden Gems: Expert Tips for Spotting Valuable Antiques",
    description: "Learn expert techniques for identifying valuable antiques with our comprehensive guide on key indicators, common pitfalls, and leveraging technology for accurate identification.",
    image: "/3-Identifying-Hidden-Gems.png",
    readTime: "7 min read"
  }
]

export default function FeaturedResources() {
  return (
    <section className="w-full py-16 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 text-xs font-heading tracking-[0.2em] uppercase text-primary border-b border-primary/30 mb-4">
            Knowledge
          </div>
          <h2 className="text-3xl font-serif italic md:text-4xl lg:text-5xl mb-6">Expert <span className="not-italic text-primary font-medium">Insights</span></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium tracking-wide">
            Explore our expert guides and insights on antique valuation and identification.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredResources.map((resource) => (
            <div key={resource.id} className="bg-background rounded-none border border-primary/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all group">
              <div className="relative h-60 w-full grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700">
                <Image
                  src={resource.image}
                  alt={resource.title}
                  fill
                  className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-center text-[10px] font-heading tracking-widest uppercase text-muted-foreground/60 mb-4">
                  <span className="text-primary/70">Heritage Guide</span>
                  <div className="flex items-center">
                    <Clock className="mr-1.5 h-3 w-3" />
                    <span>{resource.readTime}</span>
                  </div>
                </div>

                <h3 className="text-xl font-serif mb-4 leading-snug group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>

                <p className="text-muted-foreground mb-8 text-sm line-clamp-2 leading-relaxed">
                  {resource.description}
                </p>

                <Link
                  href={`/resources/${resource.id}`}
                  className="inline-flex items-center text-[11px] font-heading tracking-[0.2em] uppercase text-primary hover:text-primary/80 transition-colors border-b border-primary/20 pb-1"
                >
                  Read Full Article
                </Link>
              </div>
            </div>
          ))}
        </div>


        <div className="text-center mt-10">
          <Link href="/resources" passHref>
            <Button variant="outline" size="lg">View All Resources</Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 