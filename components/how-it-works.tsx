import { Check } from "lucide-react"

export default function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted" id="how-it-works">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple Process, Valuable Results</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our streamlined workflow makes it easy to get professional appraisals for your antique items.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
          <div className="relative flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              1
            </div>
            <div className="absolute left-full top-6 hidden h-0.5 w-full -translate-x-6 bg-border md:block"></div>
            <h3 className="text-xl font-bold">Upload Images</h3>
            <p className="text-center text-muted-foreground">
              Take clear photos of your antique item and upload them to our platform.
            </p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Supports JPEG and PNG formats</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Multiple angles for better analysis</span>
              </li>
            </ul>
          </div>
          <div className="relative flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              2
            </div>
            <div className="absolute left-full top-6 hidden h-0.5 w-full -translate-x-6 bg-border md:block"></div>
            <h3 className="text-xl font-bold">Receive AI Analysis</h3>
            <p className="text-center text-muted-foreground">
              Our AI assistant analyzes your images and provides a detailed appraisal.
            </p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Item description and history</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Condition assessment</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Audio summary available</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="text-xl font-bold">Create Valuation</h3>
            <p className="text-center text-muted-foreground">
              Provide voice feedback to refine the analysis and create your final valuation.
            </p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>One free valuation daily</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Use tokens for additional valuations</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Option for detailed premium valuations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

