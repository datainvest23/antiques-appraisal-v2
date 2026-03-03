"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

// Define featured resources - now featuring all 3 resources
export default function FeaturedResources() {
  const { t } = useLanguage();

  const featuredResources = [
    {
      id: "unlocking-antique-values",
      title: t('res1_title'),
      description: t('res1_desc'),
      image: "/1-Unlocking-Antique-Values.png",
      readTime: t('read_time_6')
    },
    {
      id: "navigating-valuation-standards",
      title: t('res2_title'),
      description: t('res2_desc'),
      image: "/2-Navigating-Valuation-Standards.png",
      readTime: t('read_time_5')
    },
    {
      id: "identifying-hidden-gems",
      title: t('res3_title'),
      description: t('res3_desc'),
      image: "/3-Identifying-Hidden-Gems.png",
      readTime: t('read_time_7')
    }
  ]

  return (
    <section className="w-full py-16 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 text-xs font-heading tracking-[0.2em] uppercase text-primary border-b border-primary/30 mb-4">
            {t('resources_label')}
          </div>
          <h2 className="text-3xl font-serif italic md:text-4xl lg:text-5xl mb-6">
            {t('resources_title').split(' ')[0]} <span className="not-italic text-primary font-medium">{t('resources_title').split(' ')[1]}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium tracking-wide">
            {t('resources_desc')}
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredResources.map((resource) => (
            <div key={resource.id} className="bg-background rounded-none border border-primary/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all group">
              <div className="relative h-60 w-full grayscale-[0.4] group-hover:grayscale-0 transition-all duration-700">
                <Image
                  src={resource.image}
                  alt={resource.title}
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>

              <div className="p-8 bg-white border-t border-amber-50">
                <div className="flex justify-between items-center text-[10px] font-heading tracking-widest uppercase text-slate-400 mb-4">
                  <span className="text-amber-700 font-bold">{t('heritage_guide')}</span>
                  <div className="flex items-center">
                    <Clock className="mr-1.5 h-3 w-3" />
                    <span>{resource.readTime}</span>
                  </div>
                </div>

                <h3 className="text-xl font-serif mb-4 leading-snug group-hover:text-amber-900 transition-colors">
                  {resource.title}
                </h3>

                <p className="text-slate-500 mb-8 text-sm line-clamp-2 leading-relaxed">
                  {resource.description}
                </p>

                <Link
                  href={`/resources/${resource.id}`}
                  className="inline-flex items-center text-[11px] font-heading tracking-[0.2em] uppercase text-amber-700 hover:text-amber-600 transition-colors border-b border-amber-200 hover:border-amber-400 pb-1 group/link"
                >
                  {t('read_full')}
                  <span className="ml-1 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>


        <div className="text-center mt-10">
          <Link href="/resources" passHref>
            <Button variant="outline" size="lg">{t('view_all_resources')}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 