import { generateText, gateway } from 'ai';
import fs from 'fs';
import path from 'path';
import { imageUrlToBase64 } from './image-utils';
import { createClient } from '@supabase/supabase-js';

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
    valuationId?: string;
};

function getSystemPrompt() {
    try {
        const promptPath = path.join(process.cwd(), 'docs/PROMPTS/advanced-gpt-prompt.md');
        return fs.readFileSync(promptPath, 'utf8');
    } catch {
        return "You are a professional antique valuation expert. Produce a detailed report.";
    }
}

function stripReasoning(text: string): string {
    // Remove <think>...</think> blocks (Perplexity reasoning tokens)
    return text
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/^[\s\S]*?(?=#+\s*1\.|#+\s*EXECUTIVE SUMMARY|#+\s*PROFESSIONAL VALUATION)/i, '')
        .trim();
}

const GEMINI_SYSTEM = `You are a document formatter. You receive a raw professional antique valuation report text and must convert it into a clean, structured JSON document.

Output ONLY valid JSON with this exact structure (no markdown, no commentary):
{
  "title": "string - object name",
  "valuation_date": "YYYY-MM-DD",
  "currency": "string",
  "confidence_level": "High | Medium | Low",
  "estimated_value_low": number,
  "estimated_value_high": number,
  "estimated_value_point": number,
  "sections": {
    "executive_summary": { "content": "markdown string" },
    "purpose_of_valuation": { "content": "markdown string" },
    "object_identification": { "content": "markdown string" },
    "attribution_analysis": { "content": "markdown string" },
    "condition_report": { "overall": "Excellent|Very Good|Good|Fair|Poor", "content": "markdown string" },
    "provenance_analysis": { "content": "markdown string" },
    "market_analysis": {
      "content": "markdown string",
      "comparable_sales": [
        { "title": "string", "auction_house": "string", "date": "string", "price": number, "currency": "string", "url": "string | null" }
      ]
    },
    "valuation_methodology": { "content": "markdown string" },
    "valuation_conclusion": { "value_range": "string", "point_estimate": "string", "content": "markdown string" },
    "risk_analysis": { "content": "markdown string" },
    "authenticity_assessment": { "probability": "string", "content": "markdown string" },
    "sale_channel_analysis": { "content": "markdown string" },
    "liquidity_assessment": { "ease_of_sale": "string", "timeframe": "string", "content": "markdown string" },
    "certification": { "content": "markdown string" },
    "forensic_image_analysis": { "content": "markdown string" }
  },
  "metadata": {
    "model": "perplexity/sonar-reasoning-pro",
    "formatted_by": "google/gemini-2.5-flash",
    "sources": []
  }
}`;

export async function POST(request: Request) {
    const req = (await request.json()) as ValuationRequest;

    console.log("Step 1: Perplexity Sonar research starting...", {
        title: req.objectDetails?.name,
        images: req.imageUrls?.length
    });

    if (!req.imageUrls || req.imageUrls.length === 0) {
        return new Response(JSON.stringify({ error: "No images provided" }), { status: 400 });
    }

    try {
        // ── STEP 1: Convert images to base64 ──────────────────────────────
        const imageBase64s = await Promise.all(
            req.imageUrls.map(url => imageUrlToBase64(url))
        );

        // ── STEP 2: Perplexity Sonar deep research ─────────────────────────
        const valuationDate = req.valuationDate ?? new Date().toISOString().slice(0, 10);
        const userPrompt = `Valuation Request:
Date: ${valuationDate}
Purpose: ${req.purpose}
Basis of Value: ${req.basisOfValue}
Currency: ${req.currency}

Object Metadata:
${JSON.stringify(req.objectDetails, null, 2)}

TASK: Produce the COMPLETE 15-section professional valuation report. 
Search the web for real comparable auction sales. 
For each comparable in Section 7, provide: title, auction house, date, price, currency, and direct URL.
Minimum 1500 words.`;

        const sonarResult = await generateText({
            model: gateway.languageModel('perplexity/sonar-reasoning-pro'),
            system: getSystemPrompt(),
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: userPrompt },
                    ...imageBase64s.map(base64 => ({
                        type: 'image' as const,
                        image: new URL(base64),
                    })),
                ],
            }],
            providerOptions: {
                gateway: {
                    user: req.userId,
                    tags: ['valuation', 'sonar-research'],
                },
            },
        });

        const rawReport = sonarResult.text;
        const cleanReport = stripReasoning(rawReport);

        console.log(`Step 1 done. Raw: ${rawReport.length} chars, Clean: ${cleanReport.length} chars`);

        // ── STEP 3: Gemini Flash formats into structured JSON ──────────────
        console.log("Step 2: Gemini Flash formatting...");

        const geminiResult = await generateText({
            model: gateway.languageModel('google/gemini-2.5-flash'),
            system: GEMINI_SYSTEM,
            messages: [{
                role: 'user',
                content: `Convert this valuation report to structured JSON (currency: ${req.currency}, date: ${valuationDate}):\n\n${cleanReport}`
            }],
            providerOptions: {
                gateway: {
                    user: req.userId,
                    tags: ['valuation', 'gemini-format'],
                },
            },
        });

        // Parse and clean the JSON response
        let reportJson: Record<string, any>;
        try {
            const jsonText = geminiResult.text
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            reportJson = JSON.parse(jsonText);
        } catch (parseErr) {
            console.error("JSON parse error, returning raw text:", parseErr);
            // Fallback: return as plain text report
            reportJson = {
                title: req.objectDetails?.name ?? 'Valuation Report',
                valuation_date: valuationDate,
                currency: req.currency,
                raw_report: cleanReport,
                error: 'JSON formatting failed, raw report included'
            };
        }

        // Add metadata
        reportJson.metadata = {
            ...reportJson.metadata,
            model: 'perplexity/sonar-reasoning-pro',
            formatted_by: 'google/gemini-2.5-flash',
            valuation_id: req.valuationId,
            created_at: new Date().toISOString(),
        };

        console.log(`Step 2 done. JSON keys: ${Object.keys(reportJson).join(', ')}`);

        // ── STEP 4: Save to Supabase ───────────────────────────────────────
        if (req.userId && req.valuationId) {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { error: dbError } = await supabase
                    .from('deep_valuations')
                    .upsert({
                        id: crypto.randomUUID(),
                        valuation_id: req.valuationId,
                        user_id: req.userId,
                        report_json: reportJson,
                        created_at: new Date().toISOString(),
                    }, { onConflict: 'valuation_id' });

                if (dbError) {
                    console.warn("Supabase save warning (non-fatal):", dbError.message);
                } else {
                    console.log("Saved to Supabase deep_valuations ✓");
                }
            } catch (dbErr: any) {
                console.warn("Supabase save failed (non-fatal):", dbErr.message);
            }
        }

        return new Response(JSON.stringify(reportJson), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("Valuation Pipeline Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
