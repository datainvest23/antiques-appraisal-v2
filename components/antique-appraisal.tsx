"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, Mic, Loader2, AlertCircle, CheckCircle, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"

// Service types
type ServiceType = "basic" | "initial" | "full"

interface AntiqueAppraisalProps {
  onSubmit: (images: File[], serviceType: ServiceType, additionalInfo: string) => Promise<void>
  analysisResult?: any
  isAnalyzing?: boolean
  activeServiceType?: ServiceType
}

export function AntiqueAppraisal({ 
  onSubmit, 
  analysisResult = null, 
  isAnalyzing = false,
  activeServiceType
}: AntiqueAppraisalProps) {
  const [selectedService, setSelectedService] = useState<ServiceType>(activeServiceType || "initial")
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const { toast } = useToast()

  // Switch to analysis tab automatically when results are available
  useEffect(() => {
    if (analysisResult && !isAnalyzing) {
      setActiveTab("analysis");
    }
  }, [analysisResult, isAnalyzing]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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

  const handleRecordFeedback = async () => {
    if (isRecording) {
      setIsRecording(false)
      toast({
        title: "Recording stopped",
        description: "Your audio has been processed.",
      })
      return
    }

    try {
      setIsRecording(true)
      // Request permission to use microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      toast({
        title: "Recording started",
        description: "Speak clearly and click the button again to stop recording.",
      })
      
      // In a real implementation, you would set up a MediaRecorder here
      // For now, we'll just simulate recording
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setError('Unable to access microphone. Please check permissions and try again.')
      setIsRecording(false)
      
      toast({
        title: "Microphone error",
        description: "Please check microphone permissions and try again.",
        variant: "destructive"
      })
    }
  }

  const handleAppraisal = async () => {
    if (images.length === 0) {
      setError("Please select at least one image to upload.")
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Use the selected service type - don't force "initial"
      await onSubmit(images, selectedService, additionalInfo)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to process appraisal request.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  // Handle download PDF report
  const handleDownloadReport = async () => {
    if (!analysisResult) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Dynamically import jsPDF and jsPDF-AutoTable to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Define colors
      const primaryColor = [41, 128, 185]; // Blue
      const secondaryColor = [90, 90, 90]; // Dark gray
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(...secondaryColor);
      
      const title = activeServiceType === "basic" || selectedService === "basic"
        ? "Antique Valuation Report"
        : activeServiceType === "initial" || selectedService === "initial"
          ? "Initial Appraisal"
          : "AI Appraisal Report";
          
      doc.text(title, 105, 20, { align: 'center' });
      
      // Add date
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.text(`Date: ${dateStr}`, 20, 30);
      
      // Add content from HTML
      let content = '';
      if (typeof analysisResult === 'object' && analysisResult.content) {
        // Get the HTML content and convert to plain text
        content = analysisResult.content.replace(/<[^>]*>/g, '');
        
        // Format the content
        doc.setFontSize(12);
        doc.setTextColor(...secondaryColor);
        const contentChunks = doc.splitTextToSize(content, 170);
        doc.text(contentChunks, 20, 40);
      }
      
      // Add images if available
      if (typeof analysisResult === 'object' && analysisResult.images && analysisResult.images.length > 0) {
        // Add a new page for images
        doc.addPage();
        
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text("Analyzed Images", 105, 20, { align: 'center' });
        
        // Position images in a grid
        const imagesPerRow = 2;
        const imgWidth = 80;
        const imgHeight = 80;
        const startY = 30;
        
        for (let i = 0; i < analysisResult.images.length; i++) {
          const row = Math.floor(i / imagesPerRow);
          const col = i % imagesPerRow;
          
          const x = 20 + (col * (imgWidth + 10));
          const y = startY + (row * (imgHeight + 10));
          
          try {
            doc.addImage(analysisResult.images[i], 'JPEG', x, y, imgWidth, imgHeight);
          } catch (error) {
            console.error('Error adding image to PDF:', error);
          }
        }
      }
      
      // Add footer
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
        title: "PDF Downloaded",
        description: "Your appraisal report has been saved as a PDF.",
      });
    } catch (error) {
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
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Antique Appraisal</h2>
          <p className="text-muted-foreground">
            Upload photos of your antique item for an AI-powered appraisal
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-4 flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Image upload */}
              <div>
                {imageUrls.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Uploaded Images</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative rounded-lg border overflow-hidden group">
                          <Image
                            src={url}
                            alt={`Uploaded image ${index + 1}`}
                            width={100}
                            height={100}
                            className="object-cover rounded-lg"
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Upload and Analyze button below thumbnails */}
                    <Button 
                      onClick={handleAppraisal} 
                      disabled={isUploading || isAnalyzing}
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                    >
                      {isUploading || isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Upload and Analyze"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center py-12 border-2 border-primary border-dashed rounded-lg shadow-sm animate-pulse-light bg-primary/5">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Camera className="h-10 w-10 text-primary" />
                      <h3 className="text-lg font-medium">Upload Antique Images</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Take a photo or upload images of your antique
                      </p>
                      <p className="text-xs text-primary font-medium">Add up to 3 images</p>
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

              {/* Right column: Select Service with Radio Group - COMPACT VERSION */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appraisal Type</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the type of appraisal you would like
                </p>

                <RadioGroup 
                  value={selectedService} 
                  onValueChange={(value) => setSelectedService(value as ServiceType)}
                  className="space-y-2"
                >
                  <div className={`flex items-start space-x-2 border rounded-md p-2 transition-all ${selectedService === "basic" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                    <RadioGroupItem value="basic" id="basic" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="basic" className="font-medium text-sm">Basic</Label>
                      <p className="text-xs text-muted-foreground mb-1">
                        Quick identification of category and era
                      </p>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-0.5">
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Categorization
                        </span>
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Era
                        </span>
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Materials
                        </span>
                      </div>
                      <p className="font-semibold text-xs">1 Token</p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-2 border rounded-md p-2 transition-all ${selectedService === "initial" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                    <RadioGroupItem value="initial" id="initial" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="initial" className="font-medium text-sm">Initial</Label>
                      <p className="text-xs text-muted-foreground mb-1">
                        Detailed analysis with value estimation
                      </p>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-0.5">
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Basic+
                        </span>
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Style
                        </span>
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Condition
                        </span>
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Value range
                        </span>
                      </div>
                      <p className="font-semibold text-xs">2 Tokens</p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-2 border rounded-md p-2 transition-all ${selectedService === "full" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                    <RadioGroupItem value="full" id="full" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="full" className="font-medium text-sm">Full</Label>
                      <p className="text-xs text-muted-foreground mb-1">
                        Comprehensive appraisal with detailed report
                      </p>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-0.5">
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Initial+
                        </span>
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          History
                        </span>
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          Detailed value
                        </span>
                        <span className="flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5 text-primary" />
                          PDF report
                        </span>
                      </div>
                      <p className="font-semibold text-xs">3 Tokens</p>
                    </div>
                  </div>
                </RadioGroup>

                {/* Additional information text area - collapsed by default */}
                <div className="mt-2 border rounded-md p-2">
                  <details>
                    <summary className="cursor-pointer font-medium text-xs">
                      Add Information About Your Item (Optional)
                    </summary>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        Provide additional context to improve accuracy
                      </p>
                      <div className="flex items-center space-x-3 mb-1">
                        <Button 
                          size="sm"
                          variant={isRecording ? "destructive" : "outline"} 
                          className="h-7 text-xs px-2"
                          onClick={handleRecordFeedback}
                        >
                          {isRecording ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Recording...
                            </>
                          ) : (
                            <>
                              <Mic className="mr-1 h-3 w-3" />
                              Record Info
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Add details about age, origin, history, markings, or other information..."
                        className="min-h-[60px] text-xs"
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                      />
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="pt-4 flex-1 overflow-auto">
            {isAnalyzing ? (
              <div className="py-6 text-center bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
                    <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-3 left-3" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">Analyzing your antique...</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Our AI is examining your images and details to provide an accurate assessment.
                </p>
                <div className="max-w-md mx-auto space-y-1">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full animate-pulse w-3/4"></div>
                  </div>
                  <p className="text-xs text-gray-400">This typically takes 30-60 seconds depending on complexity</p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="p-2 overflow-auto">
                {/* Debug output - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-40 hidden">
                    <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
                  </div>
                )}
              
                <h2 className="text-2xl font-bold mb-4 text-center text-primary">
                  {typeof analysisResult === 'string' && analysisResult.includes('Error:')
                    ? "Error"
                    : activeServiceType === "basic" || selectedService === "basic"
                      ? "Antique Valuation Report"
                      : activeServiceType === "initial" || selectedService === "initial"
                        ? "Initial Appraisal"
                        : "AI Appraisal Report"}
                </h2>
                
                {/* Display analyzed images */}
                {typeof analysisResult !== 'string' && analysisResult.images && analysisResult.images.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-center mb-3 text-slate-700">Analyzed Images</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analysisResult.images.map((imageUrl, index) => (
                        <div key={index} className="overflow-hidden rounded-lg shadow-md border border-slate-200 bg-white p-1">
                          <img 
                            src={imageUrl} 
                            alt={`Analyzed image ${index + 1}`} 
                            className="w-full h-40 object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Analysis Content */}
                <div 
                  className="prose prose-sm prose-slate max-w-none bg-white p-4 rounded-lg shadow-sm border
                            prose-table:overflow-hidden prose-thead:bg-slate-100
                            prose-th:border prose-th:border-slate-300 prose-th:p-1.5
                            prose-td:border prose-td:border-slate-200 prose-td:p-1.5
                            prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                            prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:text-slate-800
                            prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
                            prose-p:my-2 prose-p:text-slate-600
                            prose-ul:my-3 prose-ul:pl-4
                            prose-li:ml-3 prose-li:my-0.5" 
                  dangerouslySetInnerHTML={{ __html: 
                    typeof analysisResult === 'string' 
                      ? analysisResult 
                      : analysisResult.content || "Analysis completed successfully."
                  }}
                >
                </div>
                
                {/* Download PDF Report button - show for any valid analysis result */}
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleDownloadReport}
                    disabled={isGeneratingPdf || typeof analysisResult === 'string' || !analysisResult}
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
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-2">Analysis Results</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your analysis results will appear here after you submit images for appraisal.
                  </p>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6">
                    <p className="text-slate-400">No analysis data yet</p>
                    <p className="text-xs text-slate-400 mt-1">Upload images and click "Start Appraisal" to begin</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          {imageUrls.length === 0 && (
            <Button 
              onClick={handleAppraisal} 
              disabled={isUploading || isAnalyzing || images.length === 0} 
              className="w-full"
            >
              {isUploading || isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start Appraisal"
              )}
            </Button>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 