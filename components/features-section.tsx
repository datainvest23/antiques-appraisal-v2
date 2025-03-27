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
          <div className="space-y-2 max-w-3xl">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight lg:text-5xl">
              Everything You Need for Antique Appraisals
            </h2>
            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl/relaxed mt-4">
              Our platform combines AI technology with user feedback to provide accurate and detailed valuations for
              your antique items.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-16 mx-auto max-w-6xl">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative flex flex-col items-center p-6 bg-background rounded-xl border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-1 duration-300"
            >
              <div className="absolute -top-6 rounded-full bg-primary/10 p-3 border border-border/50 shadow-sm group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-4 mt-6 pt-6 text-center">
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">
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

