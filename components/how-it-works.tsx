"use client"

import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      title: t('step1_title'),
      description: t('step1_desc'),
      points: [
        t('step1_point1'),
        t('step1_point2'),
        t('step1_point3')
      ]
    },
    {
      title: t('step2_title'),
      description: t('step2_desc'),
      points: [
        t('step2_point1'),
        t('step2_point2'),
        t('step2_point3')
      ]
    },
    {
      title: t('step3_title'),
      description: t('step3_desc'),
      points: [
        t('step3_point1'),
        t('step3_point2'),
        t('step3_point3')
      ]
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
            <div className="inline-block px-4 py-1.5 text-xs font-heading tracking-[0.2em] uppercase text-primary border-b border-primary/30 mb-2">
              {t('process_label')}
            </div>
            <h2 className="text-3xl font-serif italic md:text-4xl/tight lg:text-5xl">
              {/* Special handling for highlighted Valuable Results */}
              {t('process_title').split(',')[0]}, <span className="not-italic text-primary font-medium">{t('process_title').split(',')[1]}</span>
            </h2>
            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-lg mt-4 font-medium">
              {t('process_desc')}
            </p>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 max-w-6xl mx-auto relative px-8">
          {/* Process steps with improved UI */}
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center group">
              {/* Connection lines between steps */}
              {index < steps.length - 1 && (
                <div className="absolute left-full top-8 hidden md:block w-1/2 h-[1px] bg-primary/10 z-0"></div>
              )}

              {/* Step number */}
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-none border border-primary/20 bg-background text-primary font-serif italic text-2xl mb-8 group-hover:border-primary transition-colors">
                {index + 1}
              </div>

              {/* Step content */}
              <div className="flex flex-col items-center space-y-6 text-center bg-background rounded-none p-10 border border-primary/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-primary/10 transition-all w-full h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                <h3 className="text-2xl font-serif mb-2 tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                <div className="w-8 h-[1px] bg-primary/30 my-4"></div>
                <ul className="space-y-4 mt-2 w-full">
                  {step.points.map((point, i) => (
                    <li key={i} className="flex items-center justify-center">
                      <span className="text-xs font-heading tracking-widest uppercase text-muted-foreground/80">{point}</span>
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
              <h3 className="text-2xl font-bold">{t('cta_ready')}</h3>
              <p className="text-muted-foreground max-w-md">
                {t('cta_desc')}
              </p>
            </div>
            <a href="/appraise" className="inline-flex h-12 items-center justify-center rounded-full border bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
              {t('cta_start')}
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


