"use client"

import { useState } from "react"
import { AntiqueAppraisal } from "@/components/antique-appraisal"
import { LoadingOverlay } from "@/components/loading-overlay"
import { useToast } from "@/components/ui/use-toast"
import { AuthCheck } from "@/components/auth-check"
import { useLanguage } from "@/contexts/language-context"

// Define the service types
type ServiceType = "basic" | "initial" | "full"

export default function AppraisePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [serviceType, setServiceType] = useState<ServiceType>("basic")
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleSubmit = async (images: File[], selectedService: ServiceType, additionalInfo: string = "") => {
    // This function is only used for basic and initial appraisals
    // Full appraisals are handled directly in the AntiqueAppraisal component
    if (selectedService === "full") {
      return // This will be handled by the component
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)
    setServiceType(selectedService)

    try {
      // Upload the images first
      let imageUrls: string[] = [];
      
      // Handle each image upload individually for better error tracking
      for (const image of images) {
        try {
          const singleFormData = new FormData()
          singleFormData.append('file', image)
          
          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: singleFormData,
            // Include credentials to send authentication cookies
            credentials: 'include',
          })
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            console.error('Upload error:', errorData)
            
            // Provide a more detailed error message to the user
            const errorMessage = errorData.details 
              ? `${errorData.error}: ${errorData.details}` 
              : errorData.error || 'Failed to upload image';
              
            throw new Error(errorMessage)
          }
          
          const data = await uploadResponse.json()
          if (!data.url) {
            throw new Error('No URL returned from upload')
          }
          
          imageUrls.push(data.url)
          
          toast({
            title: t("appraise.uploaded"),
            description: t("appraise.uploadProgress", { current: imageUrls.length, total: images.length }),
          })
        } catch (uploadError) {
          console.error('Error uploading individual image:', uploadError)
          toast({
            title: t("appraise.uploadError"),
            description: uploadError instanceof Error ? uploadError.message : t("appraise.unknownUploadError"),
            variant: "destructive"
          })
          throw uploadError
        }
      }
      
      // Now send the image URLs to the appropriate API endpoint based on service type
      try {
        // Determine the API endpoint based on service type
        const apiEndpoint = selectedService === "basic" 
          ? '/api/appraise-basic' 
          : '/api/appraise-initial';
        
        console.log(`Making request to ${apiEndpoint} with ${imageUrls.length} images`);
        
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
          const errorData = await analysisResponse.json();
          console.error(`Error from ${apiEndpoint}:`, errorData);
          
          // Provide a more detailed error message to the user
          const errorMessage = errorData.details 
            ? `${errorData.error}: ${errorData.details}` 
            : errorData.error || `Failed to analyze images with ${apiEndpoint}`;
            
          throw new Error(errorMessage);
        }
        
        const analysisData = await analysisResponse.json();
        console.log('Analysis data received:', analysisData);
        setAnalysisResult(analysisData);
      } catch (analysisError) {
        console.error('Error analyzing images:', analysisError)
        toast({
          title: t("appraise.analysisErrorTitle"),
          description: analysisError instanceof Error ? analysisError.message : t("appraise.unknownAnalysisError"),
          variant: "destructive"
        })
        throw analysisError
      }
    } catch (error) {
      console.error("Error in appraisal process:", error);
      
      // Try to extract more detailed error information
      let errorDetails = t("appraise.unknownError");
      if (error instanceof Error) {
        errorDetails = error.message;
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
      }
      
      setAnalysisResult({ 
        error: true, 
        content: `<div class="space-y-4">
                    <p class="text-red-500 font-bold">${t("appraise.errorTitle")}: ${errorDetails}</p>
                    <p>${t("appraise.errorTryAgain")}</p>
                    <p class="text-xs text-gray-500">${t("appraise.errorDetails", { service: selectedService })}</p>
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
          t("appraise.loading.basic.1"),
          t("appraise.loading.basic.2"),
          t("appraise.loading.basic.3"),
          t("appraise.loading.basic.4"),
        ]
      case "initial":
        return [
          t("appraise.loading.initial.1"),
          t("appraise.loading.initial.2"),
          t("appraise.loading.initial.3"),
          t("appraise.loading.initial.4"),
          t("appraise.loading.initial.5"),
        ]
      case "full":
        return [
          t("appraise.loading.full.1"),
          t("appraise.loading.full.2"),
          t("appraise.loading.full.3"),
          t("appraise.loading.full.4"),
          t("appraise.loading.full.5"),
          t("appraise.loading.full.6"),
          t("appraise.loading.full.7"),
        ]
      default:
        return [t("appraise.loading.basic.1")]
    }
  }

  return (
    <AuthCheck>
      <div className="container mx-auto h-[calc(100vh-5rem)] flex flex-col py-4 px-4">
        <LoadingOverlay isLoading={isAnalyzing} messages={getLoadingMessages()} />

        <AntiqueAppraisal 
          onSubmit={handleSubmit}
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
          activeServiceType={serviceType}
        />
      </div>
    </AuthCheck>
  )
} 
