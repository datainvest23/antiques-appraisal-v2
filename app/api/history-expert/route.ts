import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const HISTORY_EXPERT_PROMPT = `
### Role Definition:
You are a distinguished historian specializing in cultural anthropology, artifact analysis, and human evolution. Your task is to deeply analyze antique items based on provided images and descriptions, emphasizing historical context, cultural significance, and actionable insights.

### Structured Response:

1. **Macro-Historical Context:**
   - Situate the item within its broad historical, geographic, and cultural framework.
   - Highlight relevant historical events, cultural trends, or societal practices of its era and location.

2. **Detailed Item Analysis:**
   - Examine and describe historically and culturally significant features in detail.
   - Discuss notable craftsmanship, motifs, materials, and their historical or cultural implications.
   - Provide comparative analysis with known artifacts or historical references.

3. **Actionable Insights & Recommendations:**
   Clearly summarize in three sentences:
   - **Supply:** Indicate how rare or common this artifact is historically and contemporarily.
   - **Demand:** Evaluate its attractiveness to collectors or institutions.
   - **Next Steps:** Recommend specific actions (material testing, expert appraisal, preservation, etc.).

### Additional Task:
- Use web search to find three authoritative articles offering deeper historical insights or comparable examples.
- Provide a direct link and brief summary of one especially relevant article.

### Response Style & Guidelines:
- Maintain clear, concise, and professional language.
- Explicitly state any assumptions or limitations based on provided data.
- Provide precise, insightful, and actionable responses to enhance user engagement and trust.
`;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { imageUrls, category, summary, additionalInfo } = body;

    if (!imageUrls || !imageUrls.length) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Prepare the messages for the API call with tool capabilities
    const messages = [
      {
        role: "system" as const,
        content: HISTORY_EXPERT_PROMPT
      },
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: `Please analyze these images of a ${category} item. Summary of initial analysis: ${summary}. ${additionalInfo ? `Additional information: ${additionalInfo}` : ""}`
          },
          ...imageUrls.map((url: string) => ({
            type: "image_url" as const,
            image_url: { url }
          }))
        ]
      }
    ];

    try {
      // Call the OpenAI API with web search tool
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any, // Type casting due to complex structure
        temperature: 0.7,
        max_tokens: 1500,
        tools: [{
          type: "function",
          function: {
            name: "web_search",
            description: "Search the web for real-time information.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query"
                }
              },
              required: ["query"]
            }
          }
        }]
      });

      // Format the response as HTML for better presentation
      const content = response.choices[0].message.content || "";
      const formattedContent = content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^/, '<p>').replace(/$/, '</p>');

      return NextResponse.json({ content: formattedContent });
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError);
      return NextResponse.json(
        { error: 'Failed to get analysis from OpenAI' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in history expert analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze with History Expert' },
      { status: 500 }
    );
  }
} 