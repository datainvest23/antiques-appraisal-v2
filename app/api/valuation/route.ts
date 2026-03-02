import { generateText, gateway } from 'ai';
import fs from 'fs';
import path from 'path';
import { imageUrlToBase64 } from './image-utils';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // Vercel Hobby plan max. Upgrade to Pro for up to 300s.

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

const GEMINI_SYSTEM = `You are a professional report formatter specializing in antique and fine art valuations. You receive a complete raw valuation research report produced by Perplexity Sonar and must convert it into a structured JSON document.

CRITICAL RULES:
1. PRESERVE ALL CONTENT. Every fact, sentence, analysis, comparable sale, source reference, and data point from the input MUST appear in the output. Do NOT summarize, truncate, or omit anything.
2. EXPAND where needed. Each section must be a fully elaborated, professional narrative — not a brief paragraph. Reproduce the full research depth.
3. INCLUDE ALL COMPARABLES. Every comparable sale, auction result, gallery price, or market reference mentioned in the input must appear in the comparable_sales array with all available details (title, auction house, date, price, currency, URL if present).
4. INCLUDE ALL SOURCES. Every URL, citation, footnote, or reference in the input must be carried into metadata.sources as an array of objects: { "title": string, "url": string }.
5. NO DISCLAIMERS about tool limitations, knowledge cutoffs, or inability to provide information. Write as a professional appraiser with full confidence.
6. Professional language throughout — museum-grade, auction-house standard.
7. Output ONLY valid JSON — no markdown fences, no commentary outside the JSON.

Output this exact JSON structure, populating EVERY field with the full content from the input:
{
  "title": "Full descriptive object name",
  "valuation_date": "YYYY-MM-DD",
  "currency": "string",
  "confidence_level": "High | Medium | Low",
  "estimated_value_low": number,
  "estimated_value_high": number,
  "estimated_value_point": number,
  "sections": {
    "executive_summary": {
      "content": "Full multi-paragraph markdown: object identification, cultural attribution, period, estimated value range, currency, valuation date, confidence level. Must be thorough and match the research depth."
    },
    "purpose_of_valuation": {
      "content": "Full markdown: purpose, basis of value (Market/Fair Market/Replacement/etc.), IVS definitions, intended use and audience, scope of work."
    },
    "object_identification": {
      "content": "Full markdown: object type, materials, manufacturing technique, decoration, style, iconography, construction method, dimensions, weight, color, surface characteristics, tool marks, wear patterns, aging indicators, manufacturing evidence, condition observations. Professional museum-level description with maximum detail from the research."
    },
    "attribution_analysis": {
      "content": "Full markdown: culture, region, period, workshop/maker, stylistic analysis, comparative references, technical analysis, dating indicators, authenticity indicators, confidence level. Include all scholarly or auction-house comparative references mentioned."
    },
    "condition_report": {
      "overall": "Excellent | Very Good | Good | Fair | Poor",
      "content": "Full markdown: structural condition, surface condition, damage, restoration history, repairs, losses, wear, cracks, chips, patina, impact on value. Complete condition assessment."
    },
    "provenance_analysis": {
      "content": "Full markdown: complete ownership history, collection history, historical associations, documentation, gaps, impact on value. Include all provenance details from the research."
    },
    "market_analysis": {
      "content": "Full markdown narrative: complete market analysis including demand drivers, trends, collector base, regional market differences, supply/demand dynamics, market depth. Must include all analysis from the research input.",
      "comparable_sales": [
        {
          "title": "Full descriptive title of the comparable object",
          "auction_house": "Auction house or gallery name",
          "date": "Sale date",
          "price": 0,
          "currency": "string",
          "url": "Direct URL or null",
          "notes": "Additional context about the comparable (size, condition, relevance)"
        }
      ]
    },
    "valuation_methodology": {
      "content": "Full markdown: IVS approaches applied (market/cost/income), methodology explanation, adjustments made, weighting rationale, comparables selection criteria."
    },
    "valuation_conclusion": {
      "value_range": "$X,000 – $Y,000",
      "point_estimate": "$Z,000",
      "content": "Full markdown: complete reasoning for the final value determination, how comparables were weighted, adjustment factors, final conclusion statement."
    },
    "risk_analysis": {
      "content": "Full markdown: attribution uncertainty, market uncertainty, authenticity risk, market volatility, data limitations, confidence assessment, risk factors and their impact on value."
    },
    "authenticity_assessment": {
      "probability": "e.g., High (85-95%)",
      "content": "Full markdown: probability estimate with reasoning, indicators supporting authenticity, indicators raising uncertainty, recommended further tests (TL, carbon dating, pigment analysis, etc.), comparison with known genuine examples."
    },
    "sale_channel_analysis": {
      "content": "Full markdown: estimated price ranges and strategies for auction, private sale, dealer sale, insurance replacement, forced liquidation. Include specific auction houses or venues recommended with rationale."
    },
    "liquidity_assessment": {
      "ease_of_sale": "e.g., Moderate",
      "timeframe": "e.g., 6–12 months",
      "content": "Full markdown: ease of sale assessment, expected sale timeframe, market depth analysis, collector demand, seasonal factors."
    },
    "certification": {
      "content": "Full professional certification statement: the valuation represents an impartial, unbiased professional opinion of value based on available information, research, visual inspection, and market analysis, prepared in compliance with International Valuation Standards (IVS 2025) and USPAP."
    },
    "forensic_image_analysis": {
      "content": "Full markdown: detailed forensic visual analysis — manufacturing indicators, aging indicators, authenticity indicators, surface analysis, construction evidence, tool marks, patina assessment."
    }
  },
  "metadata": {
    "model": "perplexity/sonar-reasoning-pro",
    "formatted_by": "google/gemini-2.5-flash",
    "sources": [
      { "title": "Source title", "url": "https://..." }
    ]
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

    // Capture Sonar usage
    const sonarUsage = sonarResult.usage;
    // Pricing: sonar-reasoning-pro ~$5/M input, $25/M output (reasoning model)
    const SONAR_IN_PER_M = 5.00;
    const SONAR_OUT_PER_M = 25.00;
    const sonarCostUSD =
      ((sonarUsage?.inputTokens ?? 0) / 1_000_000) * SONAR_IN_PER_M +
      ((sonarUsage?.outputTokens ?? 0) / 1_000_000) * SONAR_OUT_PER_M;

    console.log(`Step 1 done. Sonar tokens in=${sonarUsage?.inputTokens} out=${sonarUsage?.outputTokens} cost=$${sonarCostUSD.toFixed(4)}`);

    // ── STEP 3: Gemini Flash formats into structured JSON ──────────────
    console.log("Step 2: Gemini Flash formatting...");

    const geminiResult = await generateText({
      model: gateway.languageModel('google/gemini-2.5-flash'),
      system: GEMINI_SYSTEM,
      messages: [{
        role: 'user',
        content: `Convert the complete valuation research below into structured JSON. Currency: ${req.currency}. Valuation date: ${valuationDate}.

IMPORTANT: Preserve ALL content, ALL comparable sales with their prices and URLs, and ALL source references. Do not shorten or summarize any section. Every section must be a complete, fully elaborated professional narrative.

---
${cleanReport}`
      }],
      providerOptions: {
        gateway: {
          user: req.userId,
          tags: ['valuation', 'gemini-format'],
        },
      },
    });

    // Capture Gemini usage
    const geminiUsage = geminiResult.usage;
    // Pricing: gemini-2.5-flash ~$0.075/M input, $0.30/M output
    const GEMINI_IN_PER_M = 0.075;
    const GEMINI_OUT_PER_M = 0.30;
    const geminiCostUSD =
      ((geminiUsage?.inputTokens ?? 0) / 1_000_000) * GEMINI_IN_PER_M +
      ((geminiUsage?.outputTokens ?? 0) / 1_000_000) * GEMINI_OUT_PER_M;

    console.log(`Step 2 done. Gemini tokens in=${geminiUsage?.inputTokens} out=${geminiUsage?.outputTokens} cost=$${geminiCostUSD.toFixed(4)}`);

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

    // Build detailed usage breakdown
    const totalCostUSD = sonarCostUSD + geminiCostUSD;
    const usageBreakdown = {
      sonar_reasoning_pro: {
        model: 'perplexity/sonar-reasoning-pro',
        input_tokens: sonarUsage?.inputTokens ?? 0,
        output_tokens: sonarUsage?.outputTokens ?? 0,
        total_tokens: sonarUsage?.totalTokens ?? 0,
        cost_usd: parseFloat(sonarCostUSD.toFixed(6)),
        pricing_note: '$5/M input, $25/M output (est.)',
      },
      gemini_flash: {
        model: 'google/gemini-2.5-flash',
        input_tokens: geminiUsage?.inputTokens ?? 0,
        output_tokens: geminiUsage?.outputTokens ?? 0,
        total_tokens: geminiUsage?.totalTokens ?? 0,
        cost_usd: parseFloat(geminiCostUSD.toFixed(6)),
        pricing_note: '$0.075/M input, $0.30/M output (est.)',
      },
      total_tokens: (sonarUsage?.totalTokens ?? 0) + (geminiUsage?.totalTokens ?? 0),
      total_cost_usd: parseFloat(totalCostUSD.toFixed(6)),
      calculated_at: new Date().toISOString(),
    };

    console.log(`Total cost: $${totalCostUSD.toFixed(4)} | Tokens: ${usageBreakdown.total_tokens}`);

    // Add metadata
    reportJson.metadata = {
      ...reportJson.metadata,
      model: 'perplexity/sonar-reasoning-pro',
      formatted_by: 'google/gemini-2.5-flash',
      valuation_id: req.valuationId,
      created_at: new Date().toISOString(),
      usage: usageBreakdown,
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
            // Token usage – Sonar
            sonar_input_tokens: sonarUsage?.inputTokens ?? 0,
            sonar_output_tokens: sonarUsage?.outputTokens ?? 0,
            sonar_total_tokens: sonarUsage?.totalTokens ?? 0,
            sonar_cost_usd: parseFloat(sonarCostUSD.toFixed(6)),
            // Token usage – Gemini
            gemini_input_tokens: geminiUsage?.inputTokens ?? 0,
            gemini_output_tokens: geminiUsage?.outputTokens ?? 0,
            gemini_total_tokens: geminiUsage?.totalTokens ?? 0,
            gemini_cost_usd: parseFloat(geminiCostUSD.toFixed(6)),
            // Combined
            total_tokens: usageBreakdown.total_tokens,
            total_cost_usd: parseFloat(totalCostUSD.toFixed(6)),
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
