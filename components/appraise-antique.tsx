"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { AlertCircle, Camera, Upload, Mic, Loader2, Download } from "lucide-react"
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
  _userId: string
  _freeValuationsLeft: number
}

export default function AppraiseAntique({ tokenBalance, _userId, _freeValuationsLeft }: AppraiseAntiqueProps) {
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
  const [_isHistoryExpertAnalyzing, setIsHistoryExpertAnalyzing] = useState(false);
  const [isEvaluationExpertAnalyzing, setIsEvaluationExpertAnalyzing] = useState(false);
  const [historyExpertResult, setHistoryExpertResult] = useState<any>(null);
  const [evaluationExpertResult, setEvaluationExpertResult] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const _removeImage = (index: number) => {
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
      // Use the new Gemini-powered API endpoint for the full service
      const response = await fetch('/api/appraise-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrls: urls,
          additionalInfo: feedback,
          serviceType: "full" // Always use full service in this component
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

  const _handleHistoryExpertAnalysis = async () => {
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
      const response = await fetch('/api/expert-appraisal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrls: imageUrls,
          category: analysisData.preliminaryCategory,
          summary: analysisData.summary,
          additionalInfo: feedback,
          analysisData: analysisData // Pass the complete analysis data
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get expert appraisal');
      }
      
      const result = await response.json();
      setEvaluationExpertResult(result);
      toast({
        title: "Expert Appraisal Complete",
        description: "Your comprehensive expert appraisal is now available.",
      });
    } catch (error: any) {
      console.error('Error getting expert appraisal:', error);
      setError(error.message || 'Failed to get expert appraisal');
      toast({
        title: "Appraisal Failed",
        description: "Unable to complete the expert appraisal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluationExpertAnalyzing(false);
    }
  };

  // Function to generate and download PDF report
  const handleDownloadReport = async () => {
    if (!analysisData) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Dynamically import jsPDF and jsPDF-AutoTable to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      // Create a new PDF document (landscape orientation for better layout)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Define colors and styles
      const primaryColor = [41, 128, 185]; // Blue
      const secondaryColor = [90, 90, 90]; // Dark gray
      const lightGrayBg = [245, 245, 245]; // Light gray background
      
      // Add the logo at the top left
      const logoUrl = '/aa_logo_h.png';
      // Add image to PDF (addImage requires a base64 string, URL, or img element)
      try {
        doc.addImage(logoUrl, 'PNG', 15, 15, 60, 15); // x, y, width, height
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
      
      // Add a horizontal line below the header
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(15, 35, 195, 35);
      
      // Add the title
      doc.setFontSize(20);
      doc.setTextColor(...secondaryColor);
      doc.text("Antiques Appraisal Report", 105, 45, { align: 'center' });
      
      // Add the item title/name
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      const itemTitle = analysisData.introduction?.title || analysisData.preliminaryCategory;
      doc.text(itemTitle, 105, 55, { align: 'center' });
      
      // Add user info and date
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      const userName = user?.email?.split('@')[0] || 'User';
      
      doc.setFontSize(11);
      doc.setTextColor(...secondaryColor);
      doc.text(`Prepared for: ${userName}`, 15, 65);
      doc.text(`Date: ${dateStr}`, 15, 70);
      doc.text(`Category: ${analysisData.preliminaryCategory}`, 15, 75);
      
      // Add summary section
      doc.setFillColor(...lightGrayBg);
      doc.roundedRect(15, 80, 180, 30, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text("Summary", 20, 88);
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      const summaryText = typeof analysisData.fullReport === 'object' && analysisData.fullReport.description 
        ? analysisData.fullReport.description 
        : analysisData.summary;
      const splitSummary = doc.splitTextToSize(summaryText, 170);
      doc.text(splitSummary, 20, 93);
      
      // Current y position after adding summary
      let yPos = 115;
      
      // Add detailed report sections
      if (typeof analysisData.fullReport === 'object') {
        // Define sections to include in the report
        const sections = [
          { title: 'Historical Context', content: analysisData.fullReport.historical_context || '' },
          { title: 'Condition & Authenticity', content: analysisData.fullReport.condition_and_authenticity || '' },
          { title: 'Purpose & Usage', content: analysisData.fullReport.use || '' },
          { title: 'Value Assessment', content: analysisData.fullReport.value || '' },
          { title: 'Next Steps', content: analysisData.fullReport.next_steps || '' }
        ];
        
        // Create a section for Full Report
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text("Full Report", 15, yPos);
        
        yPos += 8;
        
        // Add each section
        for (const section of sections) {
          // Check if we need to add a new page
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          // Add section background
          doc.setFillColor(...lightGrayBg);
          
          // Calculate height needed for this section content
          const contentLines = doc.splitTextToSize(section.content, 160);
          const contentHeight = (contentLines.length * 5) + 10; // 5mm per line plus padding
          
          doc.roundedRect(15, yPos, 180, contentHeight, 3, 3, 'F');
          
          // Add section title
          doc.setFontSize(12);
          doc.setTextColor(...primaryColor);
          doc.text(section.title, 20, yPos + 7);
          
          // Add section content
          doc.setFontSize(10);
          doc.setTextColor(...secondaryColor);
          doc.text(contentLines, 20, yPos + 13);
          
          yPos += contentHeight + 5; // Add spacing between sections
        }
      }
      
      // Add specifications section (tables)
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("Technical Specifications", 15, yPos);
      
      yPos += 8;
      
      // Physical Attributes
      autoTable(doc, {
        startY: yPos,
        head: [['Physical Attributes', '']],
        body: [
          ['Materials', analysisData.physicalAttributes.materials],
          ['Measurements', analysisData.physicalAttributes.measurements],
          ['Condition', analysisData.physicalAttributes.condition],
          ['Priority', analysisData.physicalAttributes.priority || ''],
          ['Status', analysisData.physicalAttributes.status || '']
        ],
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: lightGrayBg },
        columnStyles: { 0: { cellWidth: 40 } },
        styles: { fontSize: 10 },
        margin: { left: 15, right: 15 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      // Inscriptions
      autoTable(doc, {
        startY: yPos,
        head: [['Inscriptions', '']],
        body: [
          ['Signatures', analysisData.inscriptions.signatures],
          ['Hallmarks', analysisData.inscriptions.hallmarks],
          ['Additional Identifiers', analysisData.inscriptions.additionalIdentifiers]
        ],
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: lightGrayBg },
        columnStyles: { 0: { cellWidth: 40 } },
        styles: { fontSize: 10 },
        margin: { left: 15, right: 15 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      // Start a new page if we're too far down
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      // Stylistic Assessment
      autoTable(doc, {
        startY: yPos,
        head: [['Stylistic Assessment', '']],
        body: [
          ['Style Indicators', analysisData.stylistic.indicators],
          ['Estimated Era', analysisData.stylistic.estimatedEra],
          ['Confidence Level', analysisData.stylistic.confidenceLevel]
        ],
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: lightGrayBg },
        columnStyles: { 0: { cellWidth: 40 } },
        styles: { fontSize: 10 },
        margin: { left: 15, right: 15 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      // Value Indicators
      autoTable(doc, {
        startY: yPos,
        head: [['Value Indicators', '']],
        body: [
          ['Factors', analysisData.valueIndicators.factors],
          ['Red Flags', analysisData.valueIndicators.redFlags]
        ],
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: lightGrayBg },
        columnStyles: { 0: { cellWidth: 40 } },
        styles: { fontSize: 10 },
        margin: { left: 15, right: 15 }
      });
      
      // Add a disclaimer at the end
      doc.addPage();
      
      // Add the logo at the top left of the last page too
      try {
        doc.addImage(logoUrl, 'PNG', 15, 15, 60, 15);
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
      
      // Add a horizontal line below the header
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(15, 35, 195, 35);
      
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("Disclaimer", 15, 50);
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      const disclaimer = "This is an initial assessment based on provided images and information. A physical inspection by a specialized expert is recommended for a definitive appraisal. Antiques Appraisal does not guarantee the accuracy of this assessment.";
      const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
      doc.text(splitDisclaimer, 15, 60);
      
      // Add contact information
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text("Contact Information", 15, 80);
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.text("Antiques Appraisal", 15, 88);
      doc.text("support@antiquesappraisal.com", 15, 94);
      doc.text("www.antiquesappraisal.com", 15, 100);
      
      // Add footer to all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Antiques Appraisal - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }
      
      // Save the PDF
      doc.save(`antique-appraisal-${dateStr}.pdf`);
      
      toast({
        title: "Report Downloaded",
        description: "Your appraisal report has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate the PDF report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
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
                              alt={`Uploaded image ${index + 1}`}
                              width={200}
                              height={200}
                              className="object-contain rounded-lg"
                              style={{ width: 'auto', height: 'auto' }}
                            />
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
                  {analysisData && (
                    <div className="space-y-6">
                      {/* Category tag at top */}
                      <div className="text-center mb-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          {analysisData.preliminaryCategory}
                        </span>
                      </div>
                      
                      {/* Remove the Title and Images section - START DELETION */}
                      {/* Title and Images side by side layout */}
                      <div className="flex flex-col md:flex-row gap-6 mb-6">
                        {/* Title and Description on the left */}
                        <div className="md:w-2/3">
                          <h2 className="text-2xl font-bold mb-4">
                            {analysisData.introduction?.title || analysisData.preliminaryCategory}
                          </h2>
                          
                          <div className="text-muted-foreground">
                            <p className="mb-6">{
                              typeof analysisData.fullReport === 'object' && analysisData.fullReport.description 
                                ? analysisData.fullReport.description 
                                : typeof analysisData.fullReport === 'string' && analysisData.fullReport.includes('description:') 
                                  ? analysisData.fullReport.split('description:')[1]?.split('\n')[0]?.trim() 
                                  : typeof analysisData.fullReport === 'string'
                                    ? analysisData.fullReport
                                    : analysisData.summary
                            }</p>
                          </div>
                        </div>
                        
                        {/* Images mosaic on the right */}
                        <div className="md:w-1/3">
                          <div className="grid grid-cols-2 gap-2">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="relative aspect-square rounded-lg border overflow-hidden">
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
                      </div>
                      {/* END DELETION */}

                      {/* Remove the Full Report Sections - START DELETION */}
                      {/* Full Report Sections */}
                      <div className="mt-6 space-y-4 text-slate-700">
                        {analysisData.fullReport && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <h4 className="text-base font-semibold mb-2">Historical Context</h4>
                                  <p>{typeof analysisData.fullReport === 'object' && analysisData.fullReport.historical_context 
                                    ? analysisData.fullReport.historical_context
                                    : typeof analysisData.fullReport === 'string' && analysisData.fullReport.includes('historical_context:') 
                                      ? analysisData.fullReport.split('historical_context:')[1]?.split('\n')[0]?.trim() 
                                      : ''}</p>
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <h4 className="text-base font-semibold mb-2">Condition & Authenticity</h4>
                                  <p>{typeof analysisData.fullReport === 'object' && analysisData.fullReport.condition_and_authenticity 
                                    ? analysisData.fullReport.condition_and_authenticity 
                                    : typeof analysisData.fullReport === 'string' && analysisData.fullReport.includes('condition_and_authenticity:') 
                                      ? analysisData.fullReport.split('condition_and_authenticity:')[1]?.split('\n')[0]?.trim() 
                                      : ''}</p>
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <h4 className="text-base font-semibold mb-2">Purpose & Usage</h4>
                                  <p>{typeof analysisData.fullReport === 'object' && analysisData.fullReport.use 
                                    ? analysisData.fullReport.use 
                                    : typeof analysisData.fullReport === 'string' && analysisData.fullReport.includes('use:') 
                                      ? analysisData.fullReport.split('use:')[1]?.split('\n')[0]?.trim() 
                                      : ''}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <h4 className="text-base font-semibold mb-2">Value Assessment</h4>
                                  <p>{typeof analysisData.fullReport === 'object' && analysisData.fullReport.value 
                                    ? analysisData.fullReport.value 
                                    : typeof analysisData.fullReport === 'string' && analysisData.fullReport.includes('value:') 
                                      ? analysisData.fullReport.split('value:')[1]?.split('\n')[0]?.trim() 
                                      : ''}</p>
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <h4 className="text-base font-semibold mb-2">Next Steps</h4>
                                  <p>{typeof analysisData.fullReport === 'object' && analysisData.fullReport.next_steps 
                                    ? analysisData.fullReport.next_steps 
                                    : typeof analysisData.fullReport === 'string' && analysisData.fullReport.includes('next_steps:') 
                                      ? analysisData.fullReport.split('next_steps:')[1]?.split('\n')[0]?.trim() 
                                      : ''}</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {/* END DELETION */}

                      <div className="mt-8">
                        {analysisData && (
                          <>
                      <DetailedAnalysis analysis={analysisData as AntiqueAnalysisResult} imageUrls={imageUrls} />

                            {/* Download PDF button */}
                            <div className="mt-6 flex justify-center">
                          <Button
                            onClick={handleDownloadReport}
                            disabled={isGeneratingPdf}
                                className="flex items-center gap-2"
                          >
                            {isGeneratingPdf ? (
                              <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                              </>
                            ) : (
                              <>
                                    <Download className="h-4 w-4" />
                                    Download PDF Report
                              </>
                            )}
                          </Button>
                            </div>
                          </>
                        )}
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

