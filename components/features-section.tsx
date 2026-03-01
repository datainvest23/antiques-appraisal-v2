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
    <section className="w-full py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden" id="features">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-block px-4 py-1 text-[10px] font-heading tracking-[0.3em] uppercase text-primary border border-primary/20 mb-2">
              {t('features_label')}
            </div>
            <h2 className="text-4xl font-serif italic md:text-5xl lg:text-6xl tracking-tight">
              {t('features_title').split(' ')[0]} <span className="not-italic text-primary font-medium">{t('features_title').split(' ')[1]}</span>
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg mt-6 font-medium leading-relaxed">
              {t('features_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 mt-24 mx-auto max-w-6xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-start p-10 bg-background rounded-none border-l-[1px] border-primary/10 hover:border-primary/40 transition-all duration-500"
            >
              <div className="mb-8 p-0 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="h-8 w-8 text-primary stroke-[1.25]" />
              </div>
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-serif italic tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}


