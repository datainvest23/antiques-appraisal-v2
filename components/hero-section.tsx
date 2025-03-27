"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  useEffect(() => {
    // Try to autoplay with sound first (will likely be blocked by browsers)
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          // First try to play with sound
          videoRef.current.muted = false;
          await videoRef.current.play();
          setIsMuted(false);
        } catch (e) {
          // If that fails, play muted (which browsers allow)
          try {
            videoRef.current.muted = true;
            await videoRef.current.play();
            setIsMuted(true);
            console.log("Video playing muted due to browser autoplay policy");
          } catch (err) {
            console.error("Video autoplay failed even when muted:", err);
          }
        }
      }
    };
    
    playVideo();
    
    // Add a click event listener to the document to unmute
    const handleDocumentClick = () => {
      if (videoRef.current && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };
  
  return (
    <section className="w-full min-h-[90vh] flex items-center relative overflow-hidden bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-900/50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-secondary/20 blur-3xl"></div>
      </div>
      
      <div className="container px-4 md:px-6 z-10 py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-6 max-w-3xl">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2 animate-fade-in">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                AI-Powered Antique Valuation
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-6xl">
                Discover the <span className="text-primary">Value</span> of Your Antiques
              </h1>
              <p className="text-xl text-muted-foreground md:text-2xl/relaxed max-w-[90%]">
                Upload images of your antique items and receive AI-powered appraisals with historical context and estimated value.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/appraise">
                <Button size="lg" className="px-8 rounded-full text-lg h-12 shadow-lg hover:shadow-xl transition-all">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="px-8 rounded-full text-lg h-12 backdrop-blur-sm bg-background/50">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-sm text-muted-foreground flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>One free valuation daily • No credit card required</span>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[500px] md:max-w-[600px] aspect-video rounded-2xl overflow-hidden shadow-2xl transform transition-all animate-fade-in border border-white/20">
              {/* Video container with gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/30 to-transparent z-10 pointer-events-none"></div>
              
              {/* Video */}
              <video 
                ref={videoRef}
                src="https://twgftxpfiqryfifgajsd.supabase.co/storage/v1/object/public/pub//aa_intro2.mp4"
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              
              {/* Mute toggle button - improved styling */}
              <button 
                onClick={toggleMute}
                className="absolute bottom-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
              
              {/* Improved unmute overlay */}
              {isMuted && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
                  <div className="bg-white/90 dark:bg-slate-800/90 p-5 rounded-xl text-center max-w-xs shadow-xl">
                    <p className="mb-3 font-medium">Click to enable sound</p>
                    <Button onClick={toggleMute} className="w-full rounded-full">Enable Sound</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

