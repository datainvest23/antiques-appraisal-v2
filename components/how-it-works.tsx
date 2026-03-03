"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
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
    <section className="w-full py-24 md:py-36 lg:py-48 bg-muted/30 relative" id="how-it-works">
      {/* Decorative top wave/divider with subtle shadow */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-background z-10" aria-hidden="true">
        <div className="absolute bottom-0 w-full h-24 bg-muted/30" style={{
          clipPath: "ellipse(50% 100% at 50% 100%)"
        }}></div>
      </div>

      <div className="container px-4 md:px-6 relative z-20 mt-12 md:mt-0 text-center">
        <div className="flex flex-col items-center justify-center space-y-6 text-center mb-24">
          <div className="space-y-4 max-w-4xl">
            <div className="inline-block px-5 py-1.5 text-[9px] font-heading tracking-[0.4em] uppercase text-primary border-b border-primary/20 mb-4">
              {t('process_label')}
            </div>
            <h2 className="text-4xl font-serif italic md:text-6xl lg:text-7xl tracking-tight leading-[1.1]">
              {/* Special handling for highlighted Valuable Results */}
              {t('process_title').split(',')[0]}, <span className="not-italic text-primary font-medium">{t('process_title').split(',')[1]}</span>
            </h2>
            <p className="mx-auto max-w-[850px] text-muted-foreground md:text-xl mt-8 font-medium leading-relaxed italic font-serif">
              {t('process_desc')}
            </p>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mt-32 max-w-7xl mx-auto relative px-4 md:px-12 items-stretch">
          {/* Connection line background - desktop only */}
          <div className="absolute top-10 left-32 right-32 h-[1px] bg-primary/10 hidden lg:block z-0"></div>

          {/* Process steps */}
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center group h-full">
              {/* Step number - classic serif style */}
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-none border border-primary/10 bg-background text-primary font-serif italic text-4xl mb-12 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-sm overflow-hidden group-hover:shadow-xl group-hover:shadow-primary/20">
                <span className="relative z-10">{index + 1}</span>
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-700 -z-0"></div>
              </div>

              {/* Step content */}
              <div className="flex flex-col items-center justify-center text-center bg-background/50 backdrop-blur-sm rounded-none p-12 md:p-14 border border-primary/5 shadow-lg hover:shadow-2xl hover:border-amber-600/30 transition-all duration-700 w-full h-full relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[250px] font-serif italic text-amber-600/[0.03] select-none pointer-events-none -z-10 group-hover:scale-110 group-hover:text-amber-600/[0.06] transition-all duration-1000">
                  {index + 1}
                </div>

                <h3 className="text-3xl font-serif mb-4 tracking-tight group-hover:text-amber-700 transition-colors z-10">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base opacity-90 z-10">
                  {step.description}
                </p>

                <div className="w-12 h-[1px] bg-primary/20 my-8 z-10"></div>

                <ul className="space-y-5 mt-auto w-full z-10">
                  {step.points.map((point, i) => (
                    <li key={i} className="flex flex-col items-center justify-center">
                      <span className="text-[10px] font-heading tracking-[0.25em] uppercase text-muted-foreground/60 group-hover:text-amber-700 transition-colors">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>


        {/* Call to action - Large scale design */}
        <div className="mt-36 bg-background rounded-none border border-primary/10 p-12 md:p-20 shadow-2xl max-w-6xl mx-auto shadow-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-[0.02] pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 relative z-10 text-left">
            <div className="space-y-6">
              <h3 className="text-3xl md:text-5xl font-serif italic tracking-tight">{t('cta_ready')}</h3>
              <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-lg leading-relaxed italic font-serif">
                {t('cta_desc')}
              </p>
            </div>
            <Link href="/appraise-v2">
              <Button size="lg" className="px-16 rounded-none text-[10px] h-20 shadow-2xl shadow-primary/10 border border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all font-heading tracking-[0.3em] uppercase overflow-hidden relative group active:scale-[0.98]">
                <span className="relative z-10">{t('cta_start')}</span>
                <div className="absolute inset-0 bg-background translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-0"></div>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom wave pattern overlap fix */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-muted/30 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 w-full h-24 bg-background" style={{
          clipPath: "ellipse(50% 100% at 50% 0%)"
        }}></div>
      </div>
    </section>
  )
}


