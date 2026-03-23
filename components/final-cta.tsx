import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="w-full py-24 bg-amber-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
      
      <div className="container px-4 md:px-6 relative z-10 text-center text-amber-50">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-white mb-6">
            Ready to Uncover Your Item's Worth?
          </h2>
          <p className="text-xl md:text-2xl font-serif text-amber-200 mb-10 opacity-90">
            Join thousands of collectors who already know.
          </p>
          <Link href="/appraise">
            <Button size="lg" className="h-14 px-10 rounded-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              Start Free Appraisal <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="pt-8 text-sm text-amber-300/60 font-medium">
            No credit card required for Standard tier.
          </div>
        </div>
      </div>
    </section>
  );
}
