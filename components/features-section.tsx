import { Camera, MessageSquare, VolumeX, Coins, Clock, Award } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background" id="features">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Everything You Need for Antique Appraisals
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform combines AI technology with user feedback to provide accurate and detailed valuations for
              your antique items.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Image Upload</h3>
            <p className="text-center text-muted-foreground">
              Upload images of your antiques for AI analysis and appraisal.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI Analysis</h3>
            <p className="text-center text-muted-foreground">
              Receive detailed analysis including item description, historical context, and condition estimate.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <VolumeX className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Voice Feedback</h3>
            <p className="text-center text-muted-foreground">
              Refine the analysis by providing voice feedback that&apos;s transcribed and processed.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Daily Free Valuation</h3>
            <p className="text-center text-muted-foreground">
              Enjoy one free valuation every day, with options to purchase more as needed.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Token System</h3>
            <p className="text-center text-muted-foreground">
              Get 5 free tokens upon sign-up and purchase more for additional valuations.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Detailed Valuations</h3>
            <p className="text-center text-muted-foreground">
              Upgrade to detailed valuations for enhanced analysis and additional information.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

