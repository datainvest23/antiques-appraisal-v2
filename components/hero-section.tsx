"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Play, Volume2, VolumeX, X, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function HeroSection() {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use local video from public folder as requested
  const videoSrc = "/aa_intro2.mp4";

  return (
    <section className="w-full min-h-[90vh] flex items-center relative overflow-hidden bg-background">
      {/* Decorative background elements - Premium "Antique" aesthetic */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-[5%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] animate-pulse-slow delay-700"></div>
      </div>

      <div className="container px-4 md:px-6 z-10 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-8 max-w-3xl">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-2 animate-fade-in shadow-sm border border-primary/20">
                <span className="relative flex h-2 w-2 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t('hero_sub')}
              </div>

              <h1 className="text-5xl font-serif tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-4 leading-[1.1]">
                {t('hero_title').split('Value').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="text-primary not-italic font-medium relative inline-block">
                        Value
                        <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full"></span>
                      </span>
                    )}
                  </span>
                ))}
              </h1>

              <p className="text-xl text-muted-foreground md:text-2xl/relaxed max-w-[95%] font-medium tracking-tight leading-relaxed">
                {t('hero_desc')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link href="/appraise-v2">
                <Button size="lg" className="px-12 rounded-full text-sm h-16 shadow-xl shadow-primary/20 border-2 border-primary hover:bg-primary/90 transition-all font-heading tracking-widest uppercase active:scale-95 group">
                  {t('hero_start')}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="px-12 rounded-full text-sm h-16 shadow-none border-2 hover:bg-secondary/50 transition-all font-heading tracking-widest uppercase active:scale-95 text-muted-foreground">
                  {t('hero_learn')}
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center space-x-6 text-sm font-medium text-muted-foreground/80">
              <div className="flex items-center">
                <div className="bg-primary/10 p-1 rounded-full mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{t('hero_free')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative group w-full max-w-[550px] aspect-video">
              {/* Cinematic Video Card */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[2.5rem] blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000 -z-10"></div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <button className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-500 group-hover:scale-[1.02] group-hover:rotate-1 cursor-pointer ring-1 ring-black/5">
                    {/* Visual Placeholder/Poster with Vignette */}
                    <div className="absolute inset-0 bg-[url('/aa_logo.png')] bg-center bg-no-repeat bg-[length:60%] opacity-20 transition-transform duration-700 group-hover:scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 transition-colors group-hover:from-black/70"></div>

                    {/* Central Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-primary/95 text-white p-6 rounded-full transition-all duration-300 transform group-hover:scale-110 shadow-2xl group-hover:shadow-primary/40 ring-4 ring-white/20 flex items-center justify-center group-active:scale-95">
                        <Play className="h-8 w-8 fill-current ml-1" />
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Info className="h-5 w-5 text-white/80" />
                      </div>
                      <span className="text-white font-heading tracking-widest uppercase text-[10px] drop-shadow-md">
                        Preview: Understanding Appraisals
                      </span>
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95 border-white/10 shadow-2xl">
                  <div className="relative aspect-video w-full bg-black">
                    <video
                      src={videoSrc}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      playsInline
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

