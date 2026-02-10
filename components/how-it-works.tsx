import { Check } from "lucide-react"

export default function HowItWorks({ dictionary }: { dictionary: any }) {
  const steps = [
    {
      title: dictionary.steps.UploadImages.title,
      description: dictionary.steps.UploadImages.description,
      points: dictionary.steps.UploadImages.points
    },
    {
      title: dictionary.steps.ReceiveAIAnalysis.title,
      description: dictionary.steps.ReceiveAIAnalysis.description,
      points: dictionary.steps.ReceiveAIAnalysis.points
    },
    {
      title: dictionary.steps.CreateValuation.title,
      description: dictionary.steps.CreateValuation.description,
      points: dictionary.steps.CreateValuation.points
    }
  ];

  return (
    <section className="w-full py-20 md:py-28 lg:py-32 bg-muted relative" id="how-it-works">
      {/* Decorative curved shape divider */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-background" aria-hidden="true">
        <div className="absolute bottom-0 w-full h-16 bg-muted" style={{ 
          clipPath: "ellipse(50% 100% at 50% 100%)" 
        }}></div>
      </div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-block rounded-full bg-primary/20 dark:bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {dictionary.badge}
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight lg:text-5xl">
              {dictionary.title}
            </h2>
            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl/relaxed mt-3">
              {dictionary.description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-16 max-w-6xl mx-auto relative">
          {/* Process steps with improved UI */}
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center">
              {/* Connection lines between steps */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden md:block w-full h-0.5 bg-border/60 z-0"></div>
              )}
              
              {/* Step number */}
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground border-4 border-primary text-xl font-bold text-primary mb-6 shadow-md">
                {index + 1}
            </div>
              
              {/* Step content */}
              <div className="flex flex-col items-center space-y-4 text-center bg-background rounded-xl p-6 border border-border/50 shadow-sm w-full h-full">
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
                <ul className="space-y-3 mt-4 w-full">
                  {step.points.map((point: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-left">{point}</span>
              </li>
                  ))}
            </ul>
          </div>
            </div>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="mt-20 bg-background rounded-2xl border border-border/60 p-8 shadow-lg max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{dictionary.ctaTitle}</h3>
              <p className="text-muted-foreground max-w-md">
                {dictionary.ctaDescription}
              </p>
            </div>
            <a href="/appraise" className="inline-flex h-12 items-center justify-center rounded-full border bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
              {dictionary.ctaButton}
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom wave pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-muted" aria-hidden="true">
        <div className="absolute bottom-0 w-full h-16 bg-background" style={{ 
          clipPath: "ellipse(50% 100% at 50% 0%)" 
        }}></div>
      </div>
    </section>
  )
}
