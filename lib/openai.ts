import OpenAI from "openai"

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AntiqueAnalysisResult {
  preliminaryCategory: string
  physicalAttributes: {
    materials: string
    measurements: string
    condition: string
  }
  inscriptions: {
    signatures: string
    hallmarks: string
    additionalIdentifiers: string
  }
  uniqueFeatures: {
    motifs: string
    restoration: string
    anomalies: string
  }
  stylistic: {
    indicators: string
    estimatedEra: string
    confidenceLevel: string
  }
  attribution: {
    likelyMaker: string
    evidence: string
    probability: string
  }
  provenance: {
    infoInPhotos: string
    historicIndicators: string
    recommendedFollowup: string
  }
  intake: {
    photoCount: string
    photoQuality: string
    lightingAngles: string
    overallImpression: string
  }
  valueIndicators: {
    factors: string
    redFlags: string
    references: string
    followupQuestions: string[]
  }
  summary: string
  fullReport: string
}

const ANTIQUE_EVALUATION_PROMPT = `
You are an antiques evaluation expert. You will be provided with photographs and minimal descriptions of a single antique or collectible item, and your task is to create a fully elaborated, section-by-section initial valuation report based only on those images and details. 

**Important:** 
- Do not leave any section blank or respond with "null" if there's insufficient data. 
- Instead, explain what is missing or state "No visible markings found," "Measurements cannot be determined from photos alone," etc. 
- Always provide as much detail and context as possible within each section, even if you are making cautious assumptions based on limited evidence. 
- Include potential possibilities, comparisons, or hypothetical scenarios when exact information is unavailable.

### **Initial Valuation Template**
**Preliminary Object Category (Based on Photos)**  
Choose from (Furniture, Decorative Art, Jewelry, Silverware, Porcelain & Pottery, Paintings, Clocks, Coins, Tribal & Ethnographic, Other Collectibles). If uncertain, share your best guess and explain why.

**Observed Physical Attributes**  
1. **Materials & Techniques:** Identify what it appears to be made of (wood, metal, canvas, porcelain, etc.). Note any decorative elements or special craftsmanship.  
2. **Measurements (If Indicated or Estimable):** If no scale is provided, explain that you cannot confirm size. Otherwise, estimate or note any scale references in the photos.  
3. **Condition (From Photo Observations Only):** Describe surface wear, cracks, discoloration, or anything else you observe. Be clear that you're limited to visual cues only.

**Inscriptions, Marks, or Labels**  
1. **Signatures / Maker's Marks:** Transcribe what you see. If none are visible, say so.  
2. **Hallmarks, Stamps, or Labels:** If you see any partial or unclear marks, note your best interpretation.  
3. **Additional Identifiers:** Possibly inventory tags, prior ownership labels.

**Distinguishing or Unique Features**  
1. **Motifs & Decorations:** Describe any patterns, engravings, painted scenes, or stylized forms.  
2. **Signs of Restoration or Alteration:** Mismatched finishes, replaced components, etc.  
3. **Anomalies:** Anything that stands out as unusual, possibly modern replacements.

**Stylistic Assessment & Possible Period**  
1. **Style Indicators:** Mention design elements that suggest Art Deco, Victorian, Baroque, etc.  
2. **Estimated Era / Date Range:** If you see typical features from a particular century or region, hypothesize.  
3. **Confidence Level:** High, Medium, or Preliminary.

**Preliminary Attribution (If Possible)**  
1. **Likely Maker / Workshop / Artist:** If the style or mark points to a known manufacturer, list it.  
2. **Evidence or Rationale:** Cite hallmark guides, references, or known brand logos.  
3. **Probability & Next Steps:** If you're unsure, propose further research or expert consultation.

**Potential Provenance Clues**  
1. **Provenance Info in Photos:** Auction tags, collector labels, inscriptions.  
2. **Historic or Regional Indicators:** Coats of arms, shipping labels, anything referencing a specific locale or time.  
3. **Recommended Follow-up:** e.g., request prior bills of sale, old receipts, or previous auction listings.

**Intake & Identification**  
1. **Number and Type of Photos Provided:** List the photo perspectives.  
2. **Photo Quality & Clarity:** High, medium, or low? Mention how lighting or angles might affect your assessment.  
3. **Lighting & Angles:** Are critical areas visible (e.g., maker's mark, underside, any damage)?  
4. **Overall Impression:** Provide a short summary of your very first impression of its appearance, style, or potential category.

**Initial Value Indicators & Caveats**  
1. **Factors Affecting Value:** Rarity, brand/maker reputation, current demand, condition, authenticity.  
2. **Red Flags or Concerns:** If you suspect a reproduction, forgery, or mismatched details, note it.  
3. **References and further Research:** Provide specific topics, keywords or references that will help to undertake targeted specific research on the item, origin, era, historic context and value.
4. **Follow-up questions:** Based on the context, available information and your reasoning, ask the user clear questions to obtain specific answers to open questions that will raise your certainty of confidence when creating a valuation.

### **Usage Notes & Disclaimers**
Always clarify that this is a **preliminary review** based solely on photographs. Explain that a **physical inspection** and deeper research may be needed to confirm authenticity, condition, or value.

Please provide your response in JSON format with the following structure:
{
  "preliminaryCategory": "string",
  "physicalAttributes": {
    "materials": "string",
    "measurements": "string",
    "condition": "string"
  },
  "inscriptions": {
    "signatures": "string",
    "hallmarks": "string",
    "additionalIdentifiers": "string"
  },
  "uniqueFeatures": {
    "motifs": "string",
    "restoration": "string",
    "anomalies": "string"
  },
  "stylistic": {
    "indicators": "string",
    "estimatedEra": "string",
    "confidenceLevel": "string"
  },
  "attribution": {
    "likelyMaker": "string",
    "evidence": "string",
    "probability": "string"
  },
  "provenance": {
    "infoInPhotos": "string",
    "historicIndicators": "string",
    "recommendedFollowup": "string"
  },
  "intake": {
    "photoCount": "string",
    "photoQuality": "string",
    "lightingAngles": "string",
    "overallImpression": "string"
  },
  "valueIndicators": {
    "factors": "string",
    "redFlags": "string",
    "references": "string",
    "followupQuestions": ["string"]
  },
  "summary": "string",
  "fullReport": "string"
}
`

export async function analyzeAntique(imageUrls: string[], additionalInfo?: string): Promise<AntiqueAnalysisResult> {
  try {
    // Limit the number of images to process (OpenAI has limits)
    const limitedUrls = imageUrls.slice(0, 3); // Max 3 images
    
    console.log(`Processing ${limitedUrls.length} images for analysis`);
    
    // Prepare the messages for the API call
    const messages = [
      {
        role: "system",
        content: ANTIQUE_EVALUATION_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please analyze these images of an antique item.${
              additionalInfo ? ` Additional information: ${additionalInfo}` : ""
            }`,
          },
          ...limitedUrls.map((url) => ({
            type: "image_url",
            image_url: { url },
          })),
        ],
      },
    ];

    // Call the OpenAI API with increased timeout
    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.8,
        max_tokens: 2064,
        response_format: { type: "json_object" }
      }),
      // Set timeout promise
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("OpenAI API timeout after 60 seconds")), 60000)
      )
    ]);

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Return a structured result
    return {
      preliminaryCategory: result.preliminaryCategory || "",
      physicalAttributes: {
        materials: result.physicalAttributes?.materials || "",
        measurements: result.physicalAttributes?.measurements || "",
        condition: result.physicalAttributes?.condition || "",
      },
      inscriptions: {
        signatures: result.inscriptions?.signatures || "",
        hallmarks: result.inscriptions?.hallmarks || "",
        additionalIdentifiers: result.inscriptions?.additionalIdentifiers || "",
      },
      uniqueFeatures: {
        motifs: result.uniqueFeatures?.motifs || "",
        restoration: result.uniqueFeatures?.restoration || "",
        anomalies: result.uniqueFeatures?.anomalies || "",
      },
      stylistic: {
        indicators: result.stylistic?.indicators || "",
        estimatedEra: result.stylistic?.estimatedEra || "",
        confidenceLevel: result.stylistic?.confidenceLevel || "",
      },
      attribution: {
        likelyMaker: result.attribution?.likelyMaker || "",
        evidence: result.attribution?.evidence || "",
        probability: result.attribution?.probability || "",
      },
      provenance: {
        infoInPhotos: result.provenance?.infoInPhotos || "",
        historicIndicators: result.provenance?.historicIndicators || "",
        recommendedFollowup: result.provenance?.recommendedFollowup || "",
      },
      intake: {
        photoCount: result.intake?.photoCount || "",
        photoQuality: result.intake?.photoQuality || "",
        lightingAngles: result.intake?.lightingAngles || "",
        overallImpression: result.intake?.overallImpression || "",
      },
      valueIndicators: {
        factors: result.valueIndicators?.factors || "",
        redFlags: result.valueIndicators?.redFlags || "",
        references: result.valueIndicators?.references || "",
        followupQuestions: result.valueIndicators?.followupQuestions || [],
      },
      summary: result.summary || "",
      fullReport: result.fullReport || "",
    }
  } catch (error) {
    console.error("Error analyzing antique:", error);
    if (error.message?.includes("timeout")) {
      throw new Error("Analysis timed out. Please try with fewer or smaller images.");
    }
    throw new Error("Failed to analyze the antique. Please try again with clearer images.");
  }
}

export async function refineAnalysis(
  initialAnalysis: AntiqueAnalysisResult,
  userFeedback: string,
): Promise<AntiqueAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert antiques appraiser. Refine your analysis based on user feedback. Maintain the same JSON structure in your response.",
        },
        {
          role: "assistant",
          content: JSON.stringify(initialAnalysis),
        },
        {
          role: "user",
          content: `Please refine your analysis based on this additional information: ${userFeedback}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}")

    // Return a structured result
    return {
      preliminaryCategory: result.preliminaryCategory || initialAnalysis.preliminaryCategory,
      physicalAttributes: {
        materials: result.physicalAttributes?.materials || initialAnalysis.physicalAttributes.materials,
        measurements: result.physicalAttributes?.measurements || initialAnalysis.physicalAttributes.measurements,
        condition: result.physicalAttributes?.condition || initialAnalysis.physicalAttributes.condition,
      },
      inscriptions: {
        signatures: result.inscriptions?.signatures || initialAnalysis.inscriptions.signatures,
        hallmarks: result.inscriptions?.hallmarks || initialAnalysis.inscriptions.hallmarks,
        additionalIdentifiers:
          result.inscriptions?.additionalIdentifiers || initialAnalysis.inscriptions.additionalIdentifiers,
      },
      uniqueFeatures: {
        motifs: result.uniqueFeatures?.motifs || initialAnalysis.uniqueFeatures.motifs,
        restoration: result.uniqueFeatures?.restoration || initialAnalysis.uniqueFeatures.restoration,
        anomalies: result.uniqueFeatures?.anomalies || initialAnalysis.uniqueFeatures.anomalies,
      },
      stylistic: {
        indicators: result.stylistic?.indicators || initialAnalysis.stylistic.indicators,
        estimatedEra: result.stylistic?.estimatedEra || initialAnalysis.stylistic.estimatedEra,
        confidenceLevel: result.stylistic?.confidenceLevel || initialAnalysis.stylistic.confidenceLevel,
      },
      attribution: {
        likelyMaker: result.attribution?.likelyMaker || initialAnalysis.attribution.likelyMaker,
        evidence: result.attribution?.evidence || initialAnalysis.attribution.evidence,
        probability: result.attribution?.probability || initialAnalysis.attribution.probability,
      },
      provenance: {
        infoInPhotos: result.provenance?.infoInPhotos || initialAnalysis.provenance.infoInPhotos,
        historicIndicators: result.provenance?.historicIndicators || initialAnalysis.provenance.historicIndicators,
        recommendedFollowup: result.provenance?.recommendedFollowup || initialAnalysis.provenance.recommendedFollowup,
      },
      intake: {
        photoCount: result.intake?.photoCount || initialAnalysis.intake.photoCount,
        photoQuality: result.intake?.photoQuality || initialAnalysis.intake.photoQuality,
        lightingAngles: result.intake?.lightingAngles || initialAnalysis.intake.lightingAngles,
        overallImpression: result.intake?.overallImpression || initialAnalysis.intake.overallImpression,
      },
      valueIndicators: {
        factors: result.valueIndicators?.factors || initialAnalysis.valueIndicators.factors,
        redFlags: result.valueIndicators?.redFlags || initialAnalysis.valueIndicators.redFlags,
        references: result.valueIndicators?.references || initialAnalysis.valueIndicators.references,
        followupQuestions:
          result.valueIndicators?.followupQuestions || initialAnalysis.valueIndicators.followupQuestions,
      },
      summary: result.summary || initialAnalysis.summary,
      fullReport: result.fullReport || initialAnalysis.fullReport,
    }
  } catch (error) {
    console.error("Error refining analysis:", error)
    throw new Error("Failed to refine the analysis. Please try again.")
  }
}

export async function generateAudioSummary(text: string): Promise<string> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    })

    // Get the audio data
    await response.arrayBuffer()

    // In a real app, you would save this to a file or cloud storage
    // and return the URL. For this example, we'll just return a mock URL
    return "/api/audio/summary.mp3"
  } catch (error) {
    console.error("Error generating audio summary:", error)
    throw new Error("Failed to generate audio summary. Please try again.")
  }
}

