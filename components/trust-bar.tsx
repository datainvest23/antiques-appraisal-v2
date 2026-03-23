import { CheckCircle2 } from "lucide-react";

export function TrustBar() {
  const trustItems = [
    "Used by collectors in 40+ countries",
    "Powered by frontier AI from Google DeepMind, OpenAI & Anthropic",
    "IVS-aligned valuation methodology",
    "3 appraisal tiers — free to professional grade",
  ];

  return (
    <div className="w-full bg-muted/40 border-y border-border/40 py-6">
      <div className="container px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground sm:text-base">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{item}</span>
              {index < trustItems.length - 1 && (
                <span className="hidden md:inline-block text-border/60 ml-8 text-xl font-light">
                  |
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
