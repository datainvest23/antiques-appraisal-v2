"use client"

import Link from "next/link"
import Image from "next/image"

interface Resource {
  id: string
  title: string
  description: string
  image: string
  date: string
  readTime: string
}

interface ResourcesGridProps {
  resources: Resource[]
}

export default function ResourcesGrid({ resources }: ResourcesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {resources.map((resource) => (
        <Link 
          href={`/resources/${resource.id}`} 
          key={resource.id}
          className="group rounded-lg overflow-hidden border shadow-sm transition-all hover:shadow-md"
        >
          <div className="relative h-48 w-full overflow-hidden">
            <Image 
              src={resource.image} 
              alt={resource.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-end text-sm text-muted-foreground mb-2">
              <span>{resource.readTime}</span>
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {resource.title}
            </h2>
            <p className="text-muted-foreground">
              {resource.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
} 