import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const EVALUATION_EXPERT_PROMPT = `
### Role Definition:
You are an expert antiques evaluator focused on market analysis, valuation accuracy, and appraisal credibility. Your task involves identifying comparable items on respected antiques and auction websites to provide accurate and market-informed valuations.

### Structured Response:

1. **Item Definition & Market Analysis:**
   - Clearly summarize the item's identifying features based on images and description (materials, style, marks, condition).
   - Use web search tools to locate highly similar market items matching age, craftsmanship, and condition.

2. **Comparable Items & Pricing:**
   - List at least two relevant comparable items from current or recent market listings.
   - Provide their sale or estimated prices, clearly indicating valuation factors.

3. **Actionable Market Insights:**
   Concisely summarize in three sentences:
   - **Market Supply:** Frequency of similar items appearing in the market.
   - **Market Demand:** Current market interest level and potential buyer interest.
   - **Next Steps:** Recommend specific market actions (selling immediately, auctioning, holding, or further expert consultation).

### Additional Task:
- Clearly identify and link the most relevant auction or market comparison webpage found during your research, explaining its significance.

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
        content: EVALUATION_EXPERT_PROMPT
      },
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: `Please provide a market evaluation for this ${category} item. Summary of initial analysis: ${summary}. ${additionalInfo ? `Additional information: ${additionalInfo}` : ""}`
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
    console.error('Error in evaluation expert analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze with Evaluation Expert' },
      { status: 500 }
    );
  }
} 