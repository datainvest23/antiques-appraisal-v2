import HeroSection from "@/components/hero-section";
import { TrustBar } from "@/components/trust-bar";
import HowItWorks from "@/components/how-it-works";
import { PricingTiers } from "@/components/pricing-tiers";
import RecentAppraisals from "@/components/recent-appraisals";
import FeaturesSection from "@/components/features-section";
import FAQSection from "@/components/faq-section";
import FinalCTA from "@/components/final-cta";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center w-full">
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <PricingTiers />
      <RecentAppraisals />
      <FeaturesSection />
      <FAQSection />
      <FinalCTA />
    </main>
  );
}

