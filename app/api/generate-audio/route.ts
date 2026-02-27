import { type NextRequest, NextResponse } from "next/server"
import { generateAudioSummary } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    const audioUrl = await generateAudioSummary(text)

    return NextResponse.json({ audioUrl })
  } catch (error) {
    console.error("Error in generate-audio API route:", error)
    return NextResponse.json({ error: "Failed to generate audio summary" }, { status: 500 })
  }
}

