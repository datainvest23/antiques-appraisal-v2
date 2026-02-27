import { Camera, MessageSquare, VolumeX, Coins, Clock, Award } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden" id="features">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-block px-4 py-1 text-[10px] font-heading tracking-[0.3em] uppercase text-primary border border-primary/20 mb-2">
              Capabilities
            </div>
            <h2 className="text-4xl font-serif italic md:text-5xl lg:text-6xl tracking-tight">
              Curated <span className="not-italic text-primary font-medium">Technology</span>
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg mt-6 font-medium leading-relaxed">
              Our platform orchestrates advanced AI with historical data to provide precise valuations for your unique collections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 mt-24 mx-auto max-w-6xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-start p-10 bg-background rounded-none border-l-[1px] border-primary/10 hover:border-primary/40 transition-all duration-500"
            >
              <div className="mb-8 p-0 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="h-8 w-8 text-primary stroke-[1.25]" />
              </div>
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-serif italic tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

const features = [
  {
    icon: Camera,
    title: "Image Upload",
    description: "Upload high-quality images of your antiques for AI analysis and comprehensive appraisal."
  },
  {
    icon: MessageSquare,
    title: "AI Analysis",
    description: "Receive detailed analysis including item description, historical context, and condition assessment."
  },
  {
    icon: VolumeX,
    title: "Voice Feedback",
    description: "Refine the analysis by providing voice feedback that's transcribed and processed automatically."
  },
  {
    icon: Clock,
    title: "Daily Free Valuation",
    description: "Enjoy one free comprehensive valuation every day, with options to purchase more as needed."
  },
  {
    icon: Coins,
    title: "Token System",
    description: "Get 5 free tokens upon sign-up and purchase more tokens for additional premium valuations."
  },
  {
    icon: Award,
    title: "Detailed Valuations",
    description: "Upgrade to detailed valuations for enhanced analysis and additional historical information."
  }
];

