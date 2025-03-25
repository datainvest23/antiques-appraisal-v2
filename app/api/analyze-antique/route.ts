import { type NextRequest, NextResponse } from "next/server"
import { analyzeAntique } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, additionalInfo } = await request.json()

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "At least one image URL is required" }, { status: 400 })
    }

    const analysisResult = await analyzeAntique(imageUrls, additionalInfo)

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Error in analyze-antique API route:", error)
    return NextResponse.json({ error: "Failed to analyze the antique" }, { status: 500 })
  }
}

