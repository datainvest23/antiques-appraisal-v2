import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FeaturedResources({ dictionary }: { dictionary: any }) {
  // Define featured resources - now featuring all 3 resources
  const featuredResources = [
    {
      id: "unlocking-antique-values",
      title: dictionary.resources["unlocking-antique-values"].title,
      description: dictionary.resources["unlocking-antique-values"].description,
      image: "/1-Unlocking-Antique-Values.png",
      readTime: "6 min read"
    },
    {
      id: "navigating-valuation-standards",
      title: dictionary.resources["navigating-valuation-standards"].title,
      description: dictionary.resources["navigating-valuation-standards"].description,
      image: "/2-Navigating-Valuation-Standards.png",
      readTime: "5 min read"
    },
    {
      id: "identifying-hidden-gems",
      title: dictionary.resources["identifying-hidden-gems"].title,
      description: dictionary.resources["identifying-hidden-gems"].description,
      image: "/3-Identifying-Hidden-Gems.png",
      readTime: "7 min read"
    }
  ]

  return (
    <section className="w-full py-16 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">{dictionary.title}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {dictionary.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredResources.map((resource) => (
            <div key={resource.id} className="bg-background rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative h-48 w-full">
                <Image
                  src={resource.image}
                  alt={resource.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              <div className="p-5">
                <div className="flex justify-end text-sm text-muted-foreground mb-2">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{resource.readTime}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
                  {resource.description}
                </p>
                
                <Link 
                  href={`/resources/${resource.id}`}
                  className="w-full block"
                  passHref
                >
                  <Button variant="default" className="w-full">{dictionary.readMore}</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/resources" passHref>
            <Button variant="outline" size="lg">{dictionary.viewAll}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 