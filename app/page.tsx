import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import HowItWorks from "@/components/how-it-works"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
    </main>
  )
}

