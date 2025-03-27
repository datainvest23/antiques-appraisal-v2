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
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background relative">
      {/* Small logo in top left */}
      <div className="absolute top-0 left-0 p-4">
        <Image
          src="/aa_logo.png"
          alt="Antiques Appraisal Logo"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>
      
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Discover the Value of Your Antiques
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Upload images of your antique items and receive AI-powered appraisals with historical context and estimated value.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/appraise">
                <Button size="lg" className="px-8">Get Started</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-full max-w-[600px] sm:h-[450px] sm:max-w-[700px] lg:h-[550px] lg:max-w-[800px]">
              {/* Replace image with autoplaying video */}
              <video 
                ref={videoRef}
                src="https://twgftxpfiqryfifgajsd.supabase.co/storage/v1/object/public/pub//aa_intro2.mp4"
                className="w-full h-full rounded-lg object-cover"
                autoPlay
                playsInline
              />
              
              {/* Mute toggle button */}
              <button 
                onClick={toggleMute}
                className="absolute bottom-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
              
              {isMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div className="bg-white/90 p-4 rounded-lg text-center max-w-xs">
                    <p className="mb-2">Click anywhere to enable sound</p>
                    <Button onClick={toggleMute} size="sm">Enable Sound</Button>
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

