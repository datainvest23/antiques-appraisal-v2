"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { AlertCircle, Camera, Upload, Mic, Loader2, X } from "lucide-react"
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
import { saveValuation } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

export interface AppraiseAntiqueProps {
  tokenBalance: number
}

export default function AppraiseAntique({ tokenBalance }: AppraiseAntiqueProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("upload")
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [_analysisResult, setAnalysisResult] = useState<AntiqueAnalysisResult | null>(null)
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isHistoryExpertAnalyzing, setIsHistoryExpertAnalyzing] = useState(false);
  const [isEvaluationExpertAnalyzing, setIsEvaluationExpertAnalyzing] = useState(false);
  const [historyExpertResult, setHistoryExpertResult] = useState<any>(null);
  const [evaluationExpertResult, setEvaluationExpertResult] = useState<any>(null);

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

      // Save valuation to Supabase if user is authenticated
      if (user?.id) {
        try {
          // Default to not detailed (user can upgrade later)
          await saveValuation(user.id, analysisData, false)
          toast({
            title: "Valuation saved",
            description: "Your valuation has been saved to your account.",
          })
        } catch (saveError) {
          console.error("Error saving valuation:", saveError)
          // Continue even if saving fails - user still gets their analysis
        }
      }

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

  const handleRecordFeedback = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      return;
    }

    try {
      // Request permission to use microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Clear previous audio chunks
      const chunks: Blob[] = [];
      
      // Create new media recorder
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      // Handle recorded data
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      // Handle recording stop
      recorder.onstop = async () => {
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        // Set recording state to false
        setIsRecording(false);
        setIsTranscribing(true);
        
        // Transcribe the audio
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        try {
          const response = await fetch('/api/transcribe-audio', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to transcribe audio');
          }
          
          const data = await response.json();
          setFeedback(data.text);
          toast({
            title: "Transcription complete",
            description: "Your audio has been successfully transcribed.",
          });
        } catch (error: any) {
          console.error('Error transcribing audio:', error);
          setError('Failed to transcribe audio. Please try again or type your feedback.');
          toast({
            title: "Transcription failed",
            description: error.message || "Please try again or type your feedback.",
            variant: "destructive"
          });
        } finally {
          setIsTranscribing(false);
        }
        
        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      recorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly and click the button again to stop recording.",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please check permissions and try again.');
      toast({
        title: "Microphone error",
        description: "Please check microphone permissions and try again.",
        variant: "destructive"
      });
    }
  };

  const _handlePlayAudio = () => {
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

  const _handleSubmitFeedback = () => {
    // Implementation omitted since function is not used
    console.log("Feedback submitted")
  }

  const handleCreateValuation = async () => {
    setIsCreatingValuation(true)
    setError(null)
    setShowPaymentDialog(false)

    try {
      // Generate a title if not provided
      const title = valuationTitle || `Victorian Rosewood Side Table (${new Date().toLocaleDateString()})`
      setValuationTitle(title)

      // Simulate API call to create valuation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Valuation created successfully!",
        description: "Your valuation has been created and is now available in your valuations section.",
      })
      router.push("/my-valuations")
    } catch (error) {
      console.error("Error creating valuation:", error)
      setError("Failed to create valuation. Please try again.")
    } finally {
      setIsCreatingValuation(false)
    }
  }

  const handleHistoryExpertAnalysis = async () => {
    if (!analysisData) return;
    
    setIsHistoryExpertAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/history-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrls: imageUrls,
          category: analysisData.preliminaryCategory,
          summary: analysisData.summary,
          additionalInfo: feedback
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get history expert analysis');
      }
      
      const result = await response.json();
      setHistoryExpertResult(result);
      toast({
        title: "History Expert Analysis Complete",
        description: "Historical and cultural context analysis is now available.",
      });
    } catch (error: any) {
      console.error('Error getting history expert analysis:', error);
      setError(error.message || 'Failed to get history expert analysis');
      toast({
        title: "Analysis Failed",
        description: "Unable to complete the historical analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsHistoryExpertAnalyzing(false);
    }
  };
  
  const handleEvaluationExpertAnalysis = async () => {
    if (!analysisData) return;
    
    setIsEvaluationExpertAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/evaluation-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrls: imageUrls,
          category: analysisData.preliminaryCategory,
          summary: analysisData.summary,
          additionalInfo: feedback
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get evaluation expert analysis');
      }
      
      const result = await response.json();
      setEvaluationExpertResult(result);
      toast({
        title: "Evaluation Expert Analysis Complete",
        description: "Market valuation and comparison analysis is now available.",
      });
    } catch (error: any) {
      console.error('Error getting evaluation expert analysis:', error);
      setError(error.message || 'Failed to get evaluation expert analysis');
      toast({
        title: "Analysis Failed",
        description: "Unable to complete the market evaluation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluationExpertAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: Image upload */}
                <div>
                  {imageUrls.length > 0 ? (
                <div className="space-y-4">
                      <h3 className="text-lg font-medium">Uploaded Images</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="flex flex-col h-full items-center justify-center py-12 border-2 border-primary border-dashed rounded-lg shadow-sm animate-pulse-light bg-primary/5">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Camera className="h-10 w-10 text-primary" />
                        <h3 className="text-lg font-medium">Upload Antique Images</h3>
                        <p className="text-sm text-muted-foreground text-center">
                          Take a photo or upload images of your antique
                        </p>
                        <p className="text-xs text-primary font-medium">Step 1: Add up to 3 images</p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <Button variant="outline" asChild className="border-primary hover:bg-primary/10">
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
                        <Button variant="outline" asChild className="border-primary hover:bg-primary/10">
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
                </div>

                {/* Right column: Information about item */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Add Information About Your Item</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide additional context or details about your antique to help with the analysis.
                  </p>

                  <div className="flex items-center space-x-4">
                    <Button 
                      variant={isRecording ? "destructive" : imageUrls.length > 0 ? "default" : "outline"} 
                      onClick={handleRecordFeedback}
                      className={imageUrls.length > 0 ? "animate-pulse-subtle shadow-md" : ""}
                      disabled={isTranscribing}
                    >
                      {isRecording ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Recording... (Click to stop)
                        </>
                      ) : isTranscribing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Transcribing...
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Record Info
                          {imageUrls.length > 0 && (
                            <span className="ml-2 text-xs font-medium">(Step 2)</span>
                          )}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-2">
                    <Label htmlFor="text-feedback" className="text-sm font-medium">
                      Or type information:
                    </Label>
                    <Textarea
                      id="text-feedback"
                      placeholder="Add any details you know: age, origin, history, markings, or other information that might help with the analysis..."
                      className="mt-2 min-h-[160px]"
                      value={feedback || ""}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>
                </div>
                  </div>

              <div className="mt-6">
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading || images.length === 0} 
                  className="w-full"
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
                  <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              </div>
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
                  {/* Images horizontally at the top */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Images</h3>
                    <div className="flex justify-center gap-4 overflow-x-auto pb-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative flex-shrink-0 w-[200px] h-[200px] rounded-lg border overflow-hidden">
                          <Image
                            src={url}
                              alt={`Antique item ${index + 1}`}
                            fill
                            className="object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {analysisData && (
                    <div className="space-y-6">
                      <DetailedAnalysis analysis={analysisData.analysis || analysisData} />

                      <div className="mt-6 space-y-3">
                        <h3 className="text-lg font-medium text-center">Get Additional Expert Analysis</h3>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={handleHistoryExpertAnalysis}
                            disabled={isHistoryExpertAnalyzing}
                            className="flex-1"
                          >
                            {isHistoryExpertAnalyzing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing History...
                            </>
                          ) : (
                              "History Expert"
                            )}
                          </Button>
                          
                          <Button
                            onClick={handleEvaluationExpertAnalysis}
                            disabled={isEvaluationExpertAnalyzing}
                            className="flex-1"
                          >
                            {isEvaluationExpertAnalyzing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Evaluating Market...
                              </>
                            ) : (
                              "Evaluation Expert"
                          )}
                        </Button>
                      </div>
                      </div>

                      {historyExpertResult && (
                        <Card className="mt-6">
                          <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Historical & Cultural Context</h3>
                            <div className="prose max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: historyExpertResult.content }} />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {evaluationExpertResult && (
                        <Card className="mt-6">
                          <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Market Valuation & Comparisons</h3>
                            <div className="prose max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: evaluationExpertResult.content }} />
                            </div>
                          </CardContent>
                        </Card>
                      )}
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
            <Button onClick={() => handleCreateValuation()} disabled={isCreatingValuation}>
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

