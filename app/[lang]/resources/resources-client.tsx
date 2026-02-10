"use client"

import ResourcesGrid from "@/components/resources-grid"

// Define our resources data
// NOTE: Ideally these titles/descriptions should also come from the dictionary if they are static,
// or from a CMS/database which would handle localization.
// For now, I will use the dictionary content where possible or leave them as is if they represent dynamic content.
// Since the user asked for "complete translation", I should probably try to map these if possible,
// but typically content like blog posts is fetched.
// However, the `FeaturedResources` in `en.json` seems to contain these keys!
// Let's use the dictionary passed down.

export default function ResourcesClient({ dictionary }: { dictionary: any }) {

  const resources = [
    {
      id: "unlocking-antique-values",
      title: dictionary.FeaturedResources.resources["unlocking-antique-values"].title,
      description: dictionary.FeaturedResources.resources["unlocking-antique-values"].description,
      image: "/1-Unlocking-Antique-Values.png",
      date: "April 1, 2025",
      readTime: "6 min read"
    },
    {
      id: "navigating-valuation-standards",
      title: dictionary.FeaturedResources.resources["navigating-valuation-standards"].title,
      description: dictionary.FeaturedResources.resources["navigating-valuation-standards"].description,
      image: "/2-Navigating-Valuation-Standards.png",
      date: "April 2, 2025",
      readTime: "5 min read"
    },
    {
      id: "identifying-hidden-gems",
      title: dictionary.FeaturedResources.resources["identifying-hidden-gems"].title,
      description: dictionary.FeaturedResources.resources["identifying-hidden-gems"].description,
      image: "/3-Identifying-Hidden-Gems.png",
      date: "April 3, 2025",
      readTime: "7 min read"
    }
  ]

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{dictionary.Resources.pageTitle}</h1>
        <h2 className="text-2xl text-muted-foreground max-w-3xl mx-auto">
          {dictionary.Resources.pageSubtitle}
        </h2>
      </div>

      <ResourcesGrid resources={resources} />
    </div>
  )
}