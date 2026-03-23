"use client"

import { Zap, BrainCircuit, LineChart, ShieldCheck } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive reports in seconds, not weeks."
    },
    {
      icon: BrainCircuit,
      title: "Unbiased AI",
      description: "Data-driven analysis without human error or conflict of interest."
    },
    {
      icon: LineChart,
      title: "Market Context",
      description: "Real-time pricing data based on recent global auction results."
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      description: "Your items and data remain strictly confidential."
    }
  ];

  return (
    <section className="w-full py-20 md:py-32 lg:py-48 bg-background relative overflow-hidden" id="features">
      {/* Decorative background textures */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>

      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] -right-20 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]"></div>
        <div className="absolute bottom-[10%] -left-20 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-6 max-w-4xl">
            <div className="inline-block px-5 py-1.5 text-[9px] font-heading tracking-[0.4em] uppercase text-amber-800 border-b border-primary/20 mb-2 bg-amber-50 rounded-full font-bold">
              WHY CHOOSE US
            </div>
            <h2 className="text-4xl font-serif md:text-5xl tracking-tight leading-[1.1]">
              Beyond Basic Valuation
            </h2>
            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl mt-10 font-medium leading-relaxed font-serif opacity-80">
              Why collectors and dealers trust our insights.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 mx-auto max-w-7xl px-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="mb-6 p-5 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-slate-400 group-hover:text-amber-600 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-800 mb-3 group-hover:text-amber-900 transition-colors">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


