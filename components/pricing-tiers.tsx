import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export function PricingTiers() {
  const tiers = [
    {
      name: "Standard",
      price: "$0",
      description: "Perfect for casual collectors wondering about an item's history.",
      features: [
        "1 appraisal per day",
        "Basic provenance matching",
        "Estimated value range",
        "Standard support"
      ],
      buttonText: "Start Free",
      popular: false
    },
    {
      name: "Enthusiast",
      price: "$12",
      period: "/mo",
      description: "For serious collectors actively buying and selling.",
      features: [
        "Unlimited appraisals",
        "Detailed historical context",
        "Comparable auction records",
        "Condition impact analysis",
        "Priority support"
      ],
      buttonText: "Join Enthusiast",
      popular: true
    },
    {
      name: "Professional",
      price: "$49",
      period: "/mo",
      description: "For dealers, auction houses, and estate liquidators.",
      features: [
        "Everything in Enthusiast",
        "API access",
        "Bulk upload capabilities",
        "PDF report generation",
        "White-label branding",
        "24/7 dedicated support"
      ],
      buttonText: "Join Professional",
      popular: false
    }
  ];

  return (
    <section className="w-full py-24 md:py-32 bg-white" id="pricing">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-bold tracking-[0.25em] uppercase text-amber-800">
            PRICING & TIERS
          </div>
          <h2 className="text-4xl font-serif md:text-5xl tracking-tight">
            Valuations for Every Need
          </h2>
          <p className="max-w-[700px] text-lg text-slate-500">
            Choose the plan that fits your collecting passion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`relative flex flex-col p-8 rounded-2xl border ${
                tier.popular 
                  ? "border-amber-600 shadow-xl shadow-amber-900/5" 
                  : "border-slate-200 shadow-sm"
              } bg-white`}
            >
              {tier.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-amber-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-medium text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-sm text-slate-500 min-h-[40px]">{tier.description}</p>
              </div>
              
              <div className="mb-8 flex items-baseline text-slate-900">
                <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground ml-1">{tier.period}</span>}
              </div>

              <ul className="space-y-4 flex-1 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-amber-600 shrink-0 mr-3" />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/appraise" className="w-full">
                <Button 
                  className={`w-full h-12 rounded-lg text-base ${
                    tier.popular 
                      ? "bg-amber-600 hover:bg-amber-700 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
                  variant={tier.popular ? "default" : "secondary"}
                >
                  {tier.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
