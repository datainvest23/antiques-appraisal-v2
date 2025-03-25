"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { AlertCircle, Camera, Upload, Mic, Play, Pause, Loader2, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { AntiqueAnalysisResult } from "@/lib/openai"
import DetailedAnalysis from "@/components/detailed-analysis"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export interface AppraiseAntiqueProps {
  freeValuationsLeft: number
  tokenBalance: number
}

export default function AppraiseAntique({ freeValuationsLeft, tokenBalance }: AppraiseAntiqueProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upload")
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AntiqueAnalysisResult | null>(null)
  const [analysisData, setAnalysisData] = useState<AntiqueAnalysisResult | null>(null)
  const [audioSummary, setAudioSummary] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"token" | "direct">("token")
  const [isCreatingValuation, setIsCreatingValuation] = useState(false)
  const [valuationTitle, setValuationTitle] = useState("")
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Don't exceed 3 images total
      const remaining = 3 - images.length
      if (remaining <= 0) {
        setError("You can upload a maximum of 3 images")
        return
      }

      // Only use the first 'remaining' files if more are selected
      const newFiles = Array.from(e.target.files).slice(0, remaining)
      setImages((prevImages) => [...prevImages, ...newFiles])

      // Create URLs for preview
      const newUrls = newFiles.map((file) => URL.createObjectURL(file))
      setImageUrls((prevUrls) => [...prevUrls, ...newUrls])

      // Reset the input value so the same file can be selected again if needed
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    const newUrls = [...imageUrls]

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index])

    newImages.splice(index, 1)
    newUrls.splice(index, 1)

    setImages(newImages)
    setImageUrls(newUrls)
  }

  const handleUpload = async () => {
    if (images.length === 0) {
      setError("Please select at least one image to upload.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Upload each image to Supabase storage and collect the public URLs
      const uploadedUrls = []

      for (const image of images) {
        const formData = new FormData()
        formData.append('file', image)

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to upload image')
        }

        const { url } = await response.json()
        uploadedUrls.push(url)
      }

      // Revoke object URLs to prevent memory leaks
      imageUrls.forEach(url => URL.revokeObjectURL(url))

      // Set the uploaded URLs to state
      setImageUrls(uploadedUrls)

      // Move to analysis tab after upload
      setActiveTab("analysis")
      setIsUploading(false)

      // Start analysis
      handleAnalyze(uploadedUrls)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to upload images. Please try again.")
      }
      setIsUploading(false)
    }
  }

  const handleAnalyze = async (uploadedUrls?: string[]) => {
    const urls = uploadedUrls || imageUrls
    
    if (urls.length === 0) {
      setError("No images available for analysis.")
      return
    }
    
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-antique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrls: urls,
          additionalInfo: feedback
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze images')
      }

      const analysisData = await response.json()
      
      setAnalysisData(analysisData)
      setAnalysisResult(analysisData)

      // Generate audio summary
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: analysisData.summary })
      })

      if (!audioResponse.ok) {
        const audioData = await audioResponse.json()
        throw new Error(audioData.error || 'Failed to generate audio')
      }

      const audioData = await audioResponse.json()
      setAudioSummary(audioData.audioUrl)

      setIsAnalyzing(false)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to analyze images. Please try again.")
      }
      setIsAnalyzing(false)
    }
  }

  const handleRecordFeedback = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Start recording logic would go here
      // For demo, we'll just simulate recording
      setTimeout(() => {
        setFeedback(
          "The table actually has a maker's mark underneath that says 'Thompson & Sons, London'. Also, I believe it's rosewood, not mahogany, based on the grain pattern.",
        )
        setIsRecording(false)
      }, 3000)
    } else {
      // Stop recording logic
    }
  }

  const handlePlayAudio = () => {
    if (!audioSummary) return

    if (isPlaying && audioElement) {
      audioElement.pause()
      setIsPlaying(false)
    } else {
      // In a real app, you would play the actual audio file
      // For this example, we'll just simulate audio playback
      const audio = new Audio(audioSummary)
      audio.onended = () => setIsPlaying(false)
      audio.play().catch((err) => {
        console.error("Error playing audio:", err)
        setIsPlaying(false)
      })
      setAudioElement(audio)
      setIsPlaying(true)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedback) {
      setError("Please provide feedback before submitting.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // In a real app, you would call your API with the feedback
      // For this example, we'll simulate the API call

      // Simulate API call
      // const response = await fetch('/api/refine-analysis', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     initialAnalysis: analysisData,
      //     userFeedback: feedback
      //   })
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error || 'Failed to refine analysis');
      // setRefinedAnalysis(data.fullReport);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock refined analysis
      setRefinedAnalysis(
        "This is a mid-19th century Victorian rosewood side table, crafted by Thompson & Sons of London between 1840-1860. The piece features ornate carved details on the legs and apron, characteristic of the period. The rosewood has developed a rich patina over time, though there are some signs of wear and minor scratches on the surface. The hardware appears to be original brass pulls with an aged finish. The presence of the maker's mark adds provenance and potentially increases the value. Thompson & Sons was a well-regarded London furniture maker known for quality craftsmanship. Based on the style, craftsmanship, maker, and condition, this piece would be of significant interest to collectors of Victorian furniture.",
      )

      setIsAnalyzing(false)
    } catch (err) {
      setError("Failed to process feedback. Please try again.")
      setIsAnalyzing(false)
    }
  }

  const handleCreateValuation = () => {
    // Check if user has free valuations or needs to pay
    if (freeValuationsLeft > 0) {
      // User has a free valuation available
      processValuation("free")
    } else if (tokenBalance > 0) {
      // User has tokens, show dialog with token option pre-selected
      setPaymentMethod("token")
      setShowPaymentDialog(true)
    } else {
      // User has no tokens, show dialog with direct payment option
      setPaymentMethod("direct")
      setShowPaymentDialog(true)
    }
  }

  const processValuation = async (paymentType: "free" | "token" | "direct") => {
    setIsCreatingValuation(true)
    setError(null)
    setShowPaymentDialog(false)

    try {
      // Generate a title if not provided
      const title = valuationTitle || `Victorian Rosewood Side Table (${new Date().toLocaleDateString()})`
      setValuationTitle(title)

      // Simulate API call to create valuation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For preview purposes, just show success and redirect
      toast({
        title: "Valuation created successfully!",
        description: "Your valuation has been created and is now available in your valuations section.",
      })
      router.push("/my-valuations")
    } catch (err) {
      setError("Failed to create valuation. Please try again.")
    } finally {
      setIsCreatingValuation(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6 pt-4">
              {imageUrls.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Uploaded Images</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative rounded-lg border overflow-hidden">
                        <Image
                          src={url}
                          alt={`Antique item ${index + 1}`}
                          width={160}
                          height={160}
                          className="h-40 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 p-1 text-foreground/90 hover:bg-background"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Upload Antique Images</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Take a photo or upload images of your antique
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Button variant="outline" asChild>
                      <label>
                        <Camera className="mr-2 h-4 w-4" />
                        Take Picture
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                    </Button>
                    <Button variant="outline" asChild>
                      <label>
                        <Upload className="mr-2 h-4 w-4" />
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              )}

              {/* Voice/Text Feedback section */}
              <div className="space-y-4 mt-6 border-t pt-6">
                <h3 className="text-lg font-medium">Add Information About Your Item</h3>
                <p className="text-sm text-muted-foreground">
                  Provide additional context or details about your antique to help with the analysis.
                </p>

                <div className="flex items-center space-x-4">
                  <Button variant={isRecording ? "destructive" : "outline"} onClick={handleRecordFeedback}>
                    {isRecording ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Record Info
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4">
                  <Label htmlFor="text-feedback" className="text-sm font-medium">
                    Or type information:
                  </Label>
                  <Textarea
                    id="text-feedback"
                    placeholder="Add any details you know: age, origin, history, markings, or other information that might help with the analysis..."
                    className="mt-2"
                    value={feedback || ""}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                By registering, you agree to our Terms of Service and Privacy Policy.
                <br />
                <span className="font-medium text-primary">New users receive 5 free tokens!</span>
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={isUploading || images.length === 0} 
                className="w-full mt-4"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Analyze
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 pt-4">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Analyzing your antique...</p>
                  <p className="text-sm text-muted-foreground">Our AI is examining the details of your item</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Images</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {imageUrls.slice(0, 4).map((url, index) => (
                          <div key={index} className="aspect-square overflow-hidden rounded-lg border">
                            <Image
                              src={url || "/placeholder.svg?height=200&width=200"}
                              alt={`Antique item ${index + 1}`}
                              width={200}
                              height={200}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">AI Analysis</h3>
                      <div className="rounded-lg border p-4 h-[200px] overflow-y-auto">
                        <p className="text-sm">{analysisData?.summary || analysisResult?.summary}</p>
                      </div>
                    </div>
                  </div>

                  {analysisData && (
                    <div className="space-y-6">
                      <DetailedAnalysis analysis={analysisData} />

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePlayAudio}
                          disabled={!audioSummary || isPlaying}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Audio
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Play Audio Summary
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Required</DialogTitle>
            <DialogDescription>
              You've used your free valuation for today. Choose how you'd like to proceed:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {tokenBalance > 0 && (
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="use-token"
                  name="payment-method"
                  checked={paymentMethod === "token"}
                  onChange={() => setPaymentMethod("token")}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="use-token" className="font-medium">
                    Use 1 Token
                  </Label>
                  <p className="text-sm text-muted-foreground">You have {tokenBalance} tokens available</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="direct-payment"
                name="payment-method"
                checked={paymentMethod === "direct"}
                onChange={() => setPaymentMethod("direct")}
                className="mt-1"
              />
              <div>
                <Label htmlFor="direct-payment" className="font-medium">
                  Pay $3 for this valuation
                </Label>
                <p className="text-sm text-muted-foreground">One-time payment for this valuation only</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => processValuation(paymentMethod)} disabled={isCreatingValuation}>
              {isCreatingValuation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

