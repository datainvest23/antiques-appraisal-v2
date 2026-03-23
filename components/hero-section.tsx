"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Play, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function HeroSection() {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use local video from public folder as requested
  const videoSrc = "/aa_intro2.mp4";

  return (
    <section className="w-full min-h-[90vh] flex items-center relative overflow-hidden bg-slate-50">
      {/* Decorative background elements - Premium "Antique" aesthetic */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[800px] h-[800px] rounded-full bg-amber-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-slate-400/10 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      <div className="container px-4 md:px-6 z-10 py-12 md:py-24">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="flex flex-col justify-center space-y-10 max-w-3xl relative">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 shadow-sm backdrop-blur-md">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-800">
                  🔍 AI-POWERED ANTIQUE IDENTIFICATION & VALUATION
                </span>
              </div>

              <h1 className="text-5xl font-serif tracking-tight sm:text-7xl md:text-8xl lg:text-8xl mb-6 leading-[0.95] text-slate-900 drop-shadow-sm">
                What Is Your Antique <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 not-italic font-medium relative inline-block drop-shadow-none">Actually Worth?</span>
              </h1>

              <p className="max-w-[600px] text-lg md:text-xl text-slate-600 leading-relaxed font-serif border-l-2 border-amber-200/50 pl-4 py-1">
                Upload up to 3 photos and get a professional-grade AI appraisal in minutes — with historical context, condition assessment, and estimated market value. No expertise required.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link href="/appraise">
                  <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-md text-lg px-8 h-14 w-full sm:w-auto font-medium transition-all shadow-lg hover:shadow-xl group">
                    Get Your Free Appraisal
                    <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
                  </Button>
                </Link>
                <Link href="/sample-report" className="text-slate-600 hover:text-amber-700 font-medium text-sm sm:text-base flex items-center transition-colors">
                  See a sample report <span className="ml-1">→</span>
                </Link>
              </div>

              <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                No credit card needed · 1 free valuation daily · Results in under 60 seconds
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative group w-full max-w-[600px] aspect-[4/3] md:aspect-video">
              {/* cinematic Video Card Background Glow */}
              <div className="absolute -inset-8 bg-gradient-to-tr from-primary/15 to-accent/10 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000 -z-10 animate-pulse-slow"></div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <button className="relative w-full h-full rounded-none overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-primary/10 transition-all duration-700 group-hover:scale-[1.01] cursor-pointer outline-none ring-offset-background focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    {/* Visual Placeholder/Poster with Vignette */}
                    <div className="absolute inset-0 bg-[url('/aa_logo.png')] bg-center bg-no-repeat bg-[length:50%] opacity-[0.08] transition-all duration-1000 group-hover:scale-110 group-hover:opacity-[0.12]"></div>
                    <div className="absolute inset-0 bg-neutral-900 opacity-[0.02]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-all duration-500 group-hover:from-black/90"></div>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/20 transition-all duration-500 group-hover:w-24 group-hover:h-24"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/20 transition-all duration-500 group-hover:w-24 group-hover:h-24"></div>

                    {/* Central Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-background/90 text-primary p-7 rounded-full transition-all duration-500 transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white shadow-2xl border border-primary/20 flex items-center justify-center group-active:scale-95">
                        <Play className="h-8 w-8 fill-current ml-1" />
                      </div>
                    </div>

                    <div className="absolute bottom-8 left-8 z-20 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-none bg-primary/10 backdrop-blur-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-heading tracking-[0.2em] uppercase text-[9px] font-bold opacity-70 mb-1">Introduction</span>
                        <span className="text-white font-serif italic text-lg drop-shadow-lg tracking-wide">
                          The Appraisal Process
                        </span>
                      </div>
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-primary/20 shadow-2xl rounded-none">
                  <div className="sr-only">
                    <DialogTitle>Antique Appraisal Introduction Video</DialogTitle>
                    <DialogDescription>A video overview of our AI-powered antique valuation process.</DialogDescription>
                  </div>
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

              {/* Status indicator pill */}
              <div className="absolute -top-4 -right-4 z-20 bg-background px-4 py-2 border border-primary/10 shadow-lg text-[8px] font-bold tracking-[0.2em] uppercase text-primary">
                HD 4K Analysis
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
