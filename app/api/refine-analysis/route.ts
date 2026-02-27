import { type NextRequest, NextResponse } from "next/server"
import { refineAnalysis } from "@/lib/openai"
import type { AntiqueAnalysisResult } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { initialAnalysis, userFeedback } = await request.json()

    if (!initialAnalysis || !userFeedback) {
      return NextResponse.json({ error: "Initial analysis and user feedback are required" }, { status: 400 })
    }

    const refinedAnalysis = await refineAnalysis(initialAnalysis as AntiqueAnalysisResult, userFeedback)

    return NextResponse.json(refinedAnalysis)
  } catch (error) {
    console.error("Error in refine-analysis API route:", error)
    return NextResponse.json({ error: "Failed to refine the analysis" }, { status: 500 })
  }
}

