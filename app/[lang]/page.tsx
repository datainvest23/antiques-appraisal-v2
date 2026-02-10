import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import HowItWorks from "@/components/how-it-works"
import FeaturedResources from "@/components/featured-resources"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection dictionary={dictionary.HeroSection} />
      <HowItWorks dictionary={dictionary.HowItWorks} />
      <FeaturedResources dictionary={dictionary.FeaturedResources} />
      <FeaturesSection dictionary={dictionary.FeaturesSection} />
    </main>
  )
}
