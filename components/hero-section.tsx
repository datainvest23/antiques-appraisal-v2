import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Discover the Value of Your Antiques
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Upload images of your antique items and receive AI-powered appraisals with historical context and estimated value.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/appraise">
                <Button size="lg" className="px-8">Get Started</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
              <Image
                src="/aa_logo.png"
                alt="Antiques Appraisal Logo"
                width={500}
                height={500}
                className="object-contain w-full h-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

