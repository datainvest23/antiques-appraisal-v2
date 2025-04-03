"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isLoading: boolean
  messages: string[]
}

export function LoadingOverlay({ isLoading, messages }: LoadingOverlayProps) {
  const [currentMessage, setCurrentMessage] = useState(messages[0] || "Loading...")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    // Reset to first message when loading starts
    setCurrentIndex(0)
    setCurrentMessage(messages[0] || "Loading...")

    // Setup rotation of messages
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % messages.length
        setCurrentMessage(messages[nextIndex])
        return nextIndex
      })
    }, 3000) // Change message every 3 seconds

    return () => clearInterval(interval)
  }, [isLoading, messages])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center animate-in zoom-in-50 duration-300">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
        <h3 className="text-xl font-medium mb-2">
          {currentMessage}
        </h3>
        <p className="text-sm text-muted-foreground">
          This may take a minute, please wait...
        </p>
        <div className="mt-6 flex justify-center space-x-2">
          {messages.map((_, index) => (
            <div 
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

