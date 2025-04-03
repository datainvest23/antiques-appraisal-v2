import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import HowItWorks from "@/components/how-it-works"
import FeaturedResources from "@/components/featured-resources"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection />
      <HowItWorks />
      <FeaturedResources />
      <FeaturesSection />
    </main>
  )
}

