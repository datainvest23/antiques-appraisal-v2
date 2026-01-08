"use client"

import { useState } from "react"
import { AntiqueAppraisal } from "@/components/antique-appraisal"
import { LoadingOverlay } from "@/components/loading-overlay"
import { useToast } from "@/components/ui/use-toast"
import { AuthCheck } from "@/components/auth-check"

// Define the service types
type ServiceType = "basic" | "initial" | "full"

export default function AppraiseV2Client({ dictionary }: { dictionary: any }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [serviceType, setServiceType] = useState<ServiceType>("basic")
  const { toast } = useToast()

  const handleSubmit = async (images: File[], selectedService: ServiceType, additionalInfo: string = "") => {
    // Full appraisals are handled by the component using the appraise-v2 endpoint
    if (selectedService === "full") {
      return // This will be handled by the component
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)
    setServiceType(selectedService)

    try {
      // Upload the images first
      let imageUrls: string[] = [];
      
      // Handle each image upload
      for (const image of images) {
        try {
          const formData = new FormData()
          formData.append('file', image)
          
          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          })
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            throw new Error(errorData.error || 'Failed to upload image')
          }
          
          const data = await uploadResponse.json()
          if (!data.url) {
            throw new Error('No URL returned from upload')
          }
          
          imageUrls.push(data.url)
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          toast({
            title: "Upload error",
            description: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
            variant: "destructive"
          })
          throw uploadError
        }
      }
      
      // Determine the API endpoint based on service type
      const apiEndpoint = selectedService === "basic" 
        ? '/api/appraise-basic' 
        : '/api/appraise-initial';
      
      // Send the analysis request
      const analysisResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: imageUrls,
          additionalInfo,
        }),
      })
      
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json()
        throw new Error(errorData.error || 'Failed to analyze images')
      }
      
      const analysisData = await analysisResponse.json()
      setAnalysisResult(analysisData)
    } catch (error) {
      console.error("Error in appraisal process:", error);
      
      // Try to extract more detailed error information
      let errorDetails = "Unknown error";
      if (error instanceof Error) {
        errorDetails = error.message;
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
      }
      
      setAnalysisResult({ 
        error: true, 
        content: `<div class="space-y-4">
                    <p class="text-red-500 font-bold">Error: ${errorDetails}</p>
                    <p>Please try again or contact support if the issue persists.</p>
                    <p class="text-xs text-gray-500">Technical details: The API endpoint for the selected service 
                    (${selectedService}) returned an error. This may be due to issues with image processing 
                    or server availability.</p>
                  </div>` 
      });
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Get loading messages based on service type
  const getLoadingMessages = () => {
    switch (serviceType) {
      case "basic":
        return [
          dictionary.Appraise.loadingOverlay.analyzing,
          dictionary.Appraise.loadingOverlay.identifying,
          dictionary.Appraise.loadingOverlay.determining,
          dictionary.Appraise.loadingOverlay.finalizing,
        ]
      case "initial":
        return [
          dictionary.Appraise.loadingOverlay.analyzing,
          dictionary.Appraise.loadingOverlay.examining,
          dictionary.Appraise.loadingOverlay.researching,
          dictionary.Appraise.loadingOverlay.estimating,
          dictionary.Appraise.loadingOverlay.preparing,
        ]
      case "full":
        return [
          dictionary.Appraise.loadingOverlay.analyzingDetail,
          dictionary.Appraise.loadingOverlay.craftsmanship,
          dictionary.Appraise.loadingOverlay.historicalContext,
          dictionary.Appraise.loadingOverlay.auctionRecords,
          dictionary.Appraise.loadingOverlay.condition,
          dictionary.Appraise.loadingOverlay.marketValue,
          dictionary.Appraise.loadingOverlay.generatingReport,
        ]
      default:
        return [dictionary.Appraise.loadingOverlay.analyzing]
    }
  }

  return (
    <AuthCheck>
      <div className="container mx-auto py-8 px-4">
        <LoadingOverlay isLoading={isAnalyzing} messages={getLoadingMessages()} />

        <AntiqueAppraisal 
          onSubmit={handleSubmit} 
          analysisResult={analysisResult} 
          isAnalyzing={isAnalyzing}
          activeServiceType={serviceType}
          dictionary={dictionary}
        />
      </div>
    </AuthCheck>
  )
}
