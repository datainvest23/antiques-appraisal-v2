"use client"

import { useState } from "react"
import { AntiqueAppraisal } from "@/components/antique-appraisal"
import { LoadingOverlay } from "@/components/loading-overlay"
import { useToast } from "@/components/ui/use-toast"
import { AuthCheck } from "@/components/auth-check"

// ServiceType removed
// import { LoadingOverlay } from "@/components/loading-overlay" // LoadingOverlay import removed
// import { useToast } from "@/components/ui/use-toast" // useToast import removed, as handleSubmit is removed

export default function AppraisePage() {
  // isAnalyzing state removed
  // analysisResult state removed
  // serviceType state removed
  // toast removed

  // handleSubmit function removed

  // getLoadingMessages function removed

  return (
    <AuthCheck>
      <div className="container mx-auto h-[calc(100vh-5rem)] flex flex-col py-4 px-4">
        {/* LoadingOverlay removed */}

        <AntiqueAppraisal 
          // onSubmit prop removed
          // analysisResult prop removed
          // isAnalyzing prop removed
          // activeServiceType prop removed
        />
      </div>
    </AuthCheck>
  )
}