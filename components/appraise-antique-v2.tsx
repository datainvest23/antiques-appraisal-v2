"use client"

import { useState } from "react"
import { AntiqueAppraisal } from "@/components/antique-appraisal"
import { LoadingOverlay } from "@/components/loading-overlay"
import { useToast } from "@/components/ui/use-toast"

// Define the service types
type ServiceType = "basic" | "initial" | "full"

export default function AppraiseAntiqueV2() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [serviceType, setServiceType] = useState<ServiceType>("initial")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const { toast } = useToast()

  const handleSubmit = async (images: File[], selectedService: ServiceType, additionalInfo: string = "") => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setServiceType(selectedService)

    try {
      // Upload images first
      const uploadedUrls = []
      
      // Upload each image
      for (const image of images) {
        try {
          const formData = new FormData()
          formData.append('file', image)

          const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('Upload error:', errorData)
            throw new Error(errorData.error || 'Failed to upload image')
          }

          const data = await response.json()
          if (!data.url) {
            throw new Error('No URL returned from upload')
          }
          uploadedUrls.push(data.url)
          
          toast({
            title: "Image uploaded",
            description: `Uploaded ${uploadedUrls.length} of ${images.length} images`,
          })
        } catch (uploadError) {
          console.error('Error uploading individual image:', uploadError)
          toast({
            title: "Upload error",
            description: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
            variant: "destructive"
          })
          throw uploadError
        }
      }
      
      setImageUrls(uploadedUrls)
      
      // Send the request to the appropriate API endpoint based on service type
      try {
        // Determine the appropriate API endpoint
        let apiEndpoint = '/api/appraise-v2'; // Default for "full" service
        
        if (selectedService === "basic") {
          apiEndpoint = '/api/appraise-basic';
        } else if (selectedService === "initial") {
          apiEndpoint = '/api/appraise-initial';
        }
        
        const analysisResponse = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrls: uploadedUrls,
            additionalInfo,
            ...(selectedService === "full" && { serviceType: selectedService }), // Only include serviceType for full service
          }),
        })
        
        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json()
          throw new Error(errorData.error || 'Failed to analyze images')
        }
        
        const analysisData = await analysisResponse.json()
        setAnalysisResult(analysisData)
      } catch (analysisError) {
        console.error('Error analyzing images:', analysisError)
        toast({
          title: "Analysis error",
          description: analysisError instanceof Error ? analysisError.message : 'Unknown analysis error',
          variant: "destructive"
        })
        throw analysisError
      }
    } catch (error) {
      console.error("Error in overall process:", error)
      setAnalysisResult({ 
        error: true, 
        content: `<p class="text-red-500">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
                  <p>Please try again or contact support.</p>` 
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Get loading messages based on service type
  const getLoadingMessages = () => {
    switch (serviceType) {
      case "basic":
        return [
          "Analyzing your antique...",
          "Identifying key features...",
          "Determining category and era...",
          "Finalizing basic categorization...",
        ]
      case "initial":
        return [
          "Analyzing your antique...",
          "Examining details and markings...",
          "Researching similar items...",
          "Estimating approximate value...",
          "Preparing initial evaluation...",
        ]
      case "full":
        return [
          "Analyzing your antique in detail...",
          "Examining craftsmanship and materials...",
          "Researching historical context...",
          "Comparing with auction records...",
          "Assessing condition and rarity...",
          "Determining market value...",
          "Generating comprehensive report...",
        ]
      default:
        return ["Analyzing your antique..."]
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <LoadingOverlay isLoading={isAnalyzing} messages={getLoadingMessages()} />

      <AntiqueAppraisal 
        onSubmit={handleSubmit}
        analysisResult={analysisResult}
        isAnalyzing={isAnalyzing}
        activeServiceType={serviceType}
      />
    </div>
  )
}
