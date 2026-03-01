"use client"

import { useState } from "react"
import { AntiqueAppraisal } from "@/components/antique-appraisal"
import { LoadingOverlay } from "@/components/loading-overlay"
import { useLanguage } from "@/contexts/language-context"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { AuthCheck } from "@/components/auth-check"

// Define the service types
type ServiceType = "basic" | "initial" | "full"

export default function AppraisePage() {
  const { t } = useLanguage();
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
            title: t('error_upload_title'),
            description: uploadError instanceof Error ? uploadError.message : t('error_upload_unknown'),
            variant: "destructive"
          })
          throw uploadError
        }
      }

      // Use the unified appraise-v2 endpoint which uses the AI Gateway
      const apiEndpoint = '/api/appraise-v2';

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
                    <p class="text-red-500 font-bold">${t('error_analyze_title')}: ${errorDetails}</p>
                    <p>${t('error_analyze_retry')}</p>
                    <p class="text-xs text-gray-500">${t('error_analyze_tech')}</p>
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
          t('loading_basic_1'),
          t('loading_basic_2'),
          t('loading_basic_3'),
          t('loading_basic_4'),
        ]
      case "initial":
        return [
          t('loading_initial_1'),
          t('loading_initial_2'),
          t('loading_initial_3'),
          t('loading_initial_4'),
          t('loading_initial_5'),
        ]
      case "full":
        return [
          t('loading_full_1'),
          t('loading_full_2'),
          t('loading_full_3'),
          t('loading_full_4'),
          t('loading_full_5'),
          t('loading_full_6'),
          t('loading_full_7'),
        ]
      default:
        return [t('loading_default')]
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
        />
      </div>
    </AuthCheck>
  )
}


