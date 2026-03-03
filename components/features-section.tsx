"use client"

import { Camera, MessageSquare, VolumeX, Coins, Clock, Award } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Camera,
      title: t('feat1_title'),
      description: t('feat1_desc')
    },
    {
      icon: MessageSquare,
      title: t('feat2_title'),
      description: t('feat2_desc')
    },
    {
      icon: VolumeX,
      title: t('feat3_title'),
      description: t('feat3_desc')
    },
    {
      icon: Clock,
      title: t('feat4_title'),
      description: t('feat4_desc')
    },
    {
      icon: Coins,
      title: t('feat5_title'),
      description: t('feat5_desc')
    },
    {
      icon: Award,
      title: t('feat6_title'),
      description: t('feat6_desc')
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
            <div className="inline-block px-5 py-1.5 text-[9px] font-heading tracking-[0.4em] uppercase text-primary border border-primary/20 mb-2 bg-primary/5 backdrop-blur-sm">
              {t('features_label')}
            </div>
            <h2 className="text-4xl font-serif italic md:text-6xl lg:text-7xl tracking-tight leading-[1.1]">
              {t('features_title').split(' ')[0]} <span className="not-italic text-primary font-medium relative">{t('features_title').split(' ')[1]}
                <span className="absolute -bottom-2 translate-y-full left-0 w-full h-[1px] bg-primary/20"></span>
              </span>
            </h2>
            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl mt-10 font-medium leading-relaxed italic font-serif opacity-80">
              {t('features_desc')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mt-32 mx-auto max-w-7xl px-4">
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


