import { streamText, gateway } from 'ai';
import fs from 'fs';
import path from 'path';
import { imageUrlToBase64 } from './image-utils';

export const maxDuration = 300;

type ValuationRequest = {
    purpose:
    | 'Insurance'
    | 'Sale'
    | 'Auction Estimate'
    | 'Estate'
    | 'Financial Reporting'
    | 'Litigation'
    | 'Private Sale'
    | 'Collection Management';
    basisOfValue:
    | 'Market Value'
    | 'Fair Market Value'
    | 'Replacement Value'
    | 'Liquidation Value'
    | 'Investment Value';
    currency: string;
    valuationDate?: string;
    objectDetails: Record<string, any>;
    imageUrls: string[];
    userId?: string;
};

// Read the advanced professional prompt from docs
function getSystemPrompt() {
    try {
        const promptPath = path.join(process.cwd(), 'docs/PROMPTS/advanced-gpt-prompt.md');
        const content = fs.readFileSync(promptPath, 'utf8');
        return content;
    } catch (error) {
        console.error("Error reading system prompt file:", error);
        return "You are a professional antique valuation expert. Produce a detailed report.";
    }
}

function buildUserPrompt(req: ValuationRequest) {
    const valuationDate = req.valuationDate ?? new Date().toISOString().slice(0, 10);

    return `Valuation Request Details:
Date: ${valuationDate}
Purpose: ${req.purpose}
Basis of Value: ${req.basisOfValue}
Currency: ${req.currency}

Object Metadata:
${JSON.stringify(req.objectDetails, null, 2)}

TASK:
Produce the COMPLETE PROFESSIONAL VALUATION REPORT following the 15-section structure defined in your instructions. 
Use your web search capabilities to find real comparable sales data for Section 7.
Analyze the attached images and provided metadata to be as specific as possible.

CRITICAL REQUIREMENTS:
1. Include specific SOURCE URLs for every comparable sale in Section 7.
2. If possible, provide brief descriptions or placeholders for the images of these comparable items.
3. Minimum length: 1500 words.`;
}

export async function POST(request: Request) {
    try {
        const req = (await request.json()) as ValuationRequest;
        console.log("Valuation API Request Received (Perplexity Multimodal):", {
            title: req.objectDetails?.name,
            imageCount: req.imageUrls?.length,
        });

        if (!req.imageUrls || req.imageUrls.length === 0) {
            console.error("Valuation API Error: No images provided");
            return new Response(JSON.stringify({ error: "No images provided" }), { status: 400 });
        }

        // Convert URLs to base64 for direct input (solves fetching issues)
        const imageBase64s = await Promise.all(
            req.imageUrls.map(url => imageUrlToBase64(url))
        );

        const result = streamText({
            model: gateway.languageModel('perplexity/sonar-reasoning-pro'),
            system: getSystemPrompt(),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: buildUserPrompt(req) },
                        ...imageBase64s.map(base64 => ({
                            type: 'image' as const,
                            image: new URL(base64),
                        })),
                    ],
                },
            ],
            providerOptions: {
                gateway: {
                    user: req.userId,
                    tags: ['valuation', 'report', 'deep-analysis', 'sonar-reasoning-pro', 'multimodal'],
                },
            },
            onFinish: async ({ text, finishReason, usage }) => {
                console.log("Perplexity Multimodal Valuation Finished.");
                console.log(`Reason: ${finishReason}, Tokens: ${usage.totalTokens}, Text Length: ${text.length}`);
            }
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("AI Valuation Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
