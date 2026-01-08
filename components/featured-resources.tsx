"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { resourcesByLanguage } from "@/lib/translations"

export default function FeaturedResources() {
  const { language, t } = useLanguage()
  const featuredResources = resourcesByLanguage[language]

  return (
    <section className="w-full py-16 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">{t("featured.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("featured.subtitle")}
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
                    <span>{t("resources.readTime", { minutes: resource.readTimeMinutes })}</span>
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
                  <Button variant="default" className="w-full">{t("featured.readMore")}</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/resources" passHref>
            <Button variant="outline" size="lg">{t("featured.viewAll")}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 
