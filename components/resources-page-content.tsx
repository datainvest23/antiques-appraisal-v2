"use client"

import ResourcesGrid from "@/components/resources-grid"
import { useLanguage } from "@/contexts/language-context"
import { resourcesByLanguage } from "@/lib/translations"

export default function ResourcesPageContent() {
  const { language, t } = useLanguage()
  const resources = resourcesByLanguage[language]

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("resources.pageTitle")}</h1>
        <h2 className="text-2xl text-muted-foreground max-w-3xl mx-auto">
          {t("resources.pageSubtitle")}
        </h2>
      </div>

      <ResourcesGrid resources={resources} />
    </div>
  )
}
