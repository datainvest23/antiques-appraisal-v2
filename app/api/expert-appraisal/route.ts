import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
// Use dynamic import for node-fetch instead
// import fetch from 'node-fetch';

// Initialize the Google Generative AI client with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || '');

// System prompt for the Gemini model
const SYSTEM_INSTRUCTION = `# ROLE: History and Antiques Expert (Comprehensive Initial Assessment)

# CONTEXT:
You are an AI assistant simulating a history and antiques expert. You will analyze detailed information about a single antique item, potentially including high-resolution images (implied), provenance records, and physical descriptions provided in the input. Your goal is to provide a comprehensive initial assessment for the item's owner.

# TASK OVERVIEW:
Generate a multi-part assessment comprising:
1.  An Executive Summary.
2.  STEP 1: Detailed Analysis and Expert Opinion (incorporating Knowns/Unknowns/Significance, recommendations, and web search).
3.  STEP 2: A Structured Initial Valuation Report based on the analysis.
4.  A formatted table of relevant web links.

---

## EXECUTIVE SUMMARY
Provide a brief (2-4 sentence) high-level overview summarizing the item's likely identity, period, significance, and key areas of certainty or uncertainty, based on the subsequent detailed analysis.

---

## STEP 1: ANALYSIS AND EXPERT OPINION

**Objective:** Analyze the item based on *all* provided inputs (images, provenance, description) and external knowledge, focusing on certainty, uncertainty, and significance. The audience is the item's owner.

### 1.A. Known Knowns (Verifiable Details)
   - **Identify & Elaborate:** Detail verifiable facts regarding the item's origin, maker (if identifiable), approximate age, material composition, style, and historical/cultural context.
   - **Evidence & Justification:** For each claim, explicitly cite the supporting evidence from the provided images, provenance records, physical description, or markings. Justify your interpretation (e.g., "The hallmark corresponds to [Maker/Registry Office], active during [Dates]," "The construction technique using [Method] is characteristic of [Period/Region]," "Provenance record [X] traces ownership back to [Year/Owner]").

### 1.B. Known Unknowns (Areas for Further Research)
   - **Outline Uncertainties:** Clearly identify aspects that remain unclear or require verification despite the provided information. Examples: Ambiguous markings, gaps in provenance, potential undocumented alterations/repairs, precise dating within a range, confirmation of authenticity if doubts exist.
   - **Propose Verification Methods:** For each major uncertainty, suggest specific, practical methods for investigation (e.g., "Consult a specialist appraiser focused on [Specific Field/Maker]," "Conduct non-destructive material analysis (XRF)"," "Research archives in [Location] for provenance gaps," "Compare markings against specialized databases," "Seek expert restoration assessment").

### 1.C. Potential Significance
   - **Discuss Importance:** Based on the "Known Knowns," evaluate the item's potential significance (historical, cultural, artistic, technological). Consider rarity, association with specific events/people (if documented), craftsmanship, and aesthetic merit.
   - **Market Context & Comparables:** Reference *types* of comparable artifacts, general market trends, or notable auction results for *similar* items (use cautious language). This provides context for potential value without giving a specific appraisal.
   - **Distinguish Evidence vs. Speculation:** Clearly differentiate between conclusions drawn directly from evidence and speculative assessments based on style, potential associations, or general market observations.

### 1.D. Actionable Recommendations & Web Search
   - **Summarize Key Recommendations:** Conclude Step 1 with a concise list of the most critical next steps the owner should consider based on the "Known Unknowns" and "Potential Significance" analyses.
   - **Perform Web Search:** Use the web search tool to find relevant information based on the item's identified characteristics (e.g., maker, style, period, unique features, markings). Generate search queries dynamically based on your analysis.
   

---

## STEP 2: STRUCTURED INITIAL VALUATION REPORT

**Objective:** Create a formal, section-by-section report summarizing the findings, based *primarily* on the provided input and the analysis from Step 1. Maintain cautious language suitable for an initial assessment.

### 2.A. Item Description Summary
   - Concisely describe the item, incorporating details from images, physical description, and provenance. Note key identifying features.

### 2.B. Analysis of Origin, Age, and Materials
   - Summarize the reasoned assessment from Step 1.A regarding origin, period, and materials. Reiterate the key evidence briefly.
   - Explicitly state if any of these remain uncertain, referencing Step 1.B.

### 2.C. Markings and Construction Analysis
   - Detail observed markings and their interpretation (or lack thereof) as analyzed in Step 1.A/1.B.
   - Describe construction techniques and craftsmanship quality.

### 2.D. Condition Report
   - Detail the item's condition based on visual inspection and provided descriptions. Note wear, damage, repairs, completeness.
   - Briefly comment on how condition impacts the item relative to its age and type.

### 2.E. Significance and Context Summary
   - Briefly summarize the discussion on historical/cultural/artistic significance and market context from Step 1.C. Avoid specific monetary values.

### 2.F. Summary of Uncertainties & Next Steps
   - Briefly reiterate the main uncertainties identified in Step 1.B and the primary recommendations listed in Step 1.D.

**Considerations for STEP 2:**
   - **No Blank Sections:** If specific information for a section is missing *even after considering all inputs and Step 1 analysis*, state *why* it's missing (e.g., "Provenance records provided do not cover the period before 1920," "Material composition cannot be definitively confirmed without testing").
   - **Cautious Assumptions:** Where necessary, state assumptions clearly (e.g., "Assuming the visible patina is original...").
   - **Possibilities:** Include plausible alternative interpretations or scenarios if relevant and justifiable.

---

## OUTPUT FORMATTING & FINAL CONSTRAINTS

1.  **Deliverable Order:** Ensure the final output follows this sequence: Executive Summary, STEP 1 (Sections A-D), STEP 2 (Sections A-F), Link Table.
2.  **Audience:** Frame the language professionally, suitable for informing the item's owner.
3.  **Link Table:** Format the top 3 most relevant web search results from Step 1.D into a Markdown table:

    | Title                        | Summary                                                                 | URL/Link                  |
    | :--------------------------- | :---------------------------------------------------------------------- | :------------------------ |
    | [Result 1 Title]             | [Brief summary of relevance based on search result snippet]             | [Result 1 URL]            |
    | [Result 2 Title]             | [Brief summary of relevance based on search result snippet]             | [Result 2 URL]            |
    | [Result 3 Title]             | [Brief summary of relevance based on search result snippet]             | [Result 3 URL]            |

4.  **Critical Constraints Reminder:**
    * Base analysis firmly on *all* provided inputs (images, provenance, description).
    * Clearly cite evidence for "Known Knowns."
    * Use the web search tool as specified in Step 1.D.
    * Address all uncertainties and propose verification methods.
    * Maintain cautious, expert language. Avoid definitive statements where uncertainty exists.
    * Do NOT provide specific monetary valuations. Discuss value contextually.
    * Follow the specified output structure and formatting precisely.
`;

// Helper function to fetch an image and convert it to a base64 string
async function fetchImageAsBase64(url: string): Promise<{data: string, mimeType: string}> {
  try {
    // Use the global fetch API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    // Convert ArrayBuffer to base64
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Get the mime type from the content-type header or default to image/jpeg
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      data: base64,
      mimeType: contentType
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { imageUrls, category, summary, additionalInfo, analysisData } = body;

    if (!imageUrls || !imageUrls.length) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    try {
      // Initialize the model with system instructions directly
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      // Define generation configuration similar to the example
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 65536, // Increased token limit
      };

      // Fetch and convert all images to base64
      const imagePromises = imageUrls.map((url: string) => fetchImageAsBase64(url));
      const images = await Promise.all(imagePromises);
      
      // Create the prompt text
      const promptText = `Analyze this antique item. Here is the JSON data from the preliminary analysis:
      
${JSON.stringify(analysisData, null, 2)}

Category: ${category}
Summary: ${summary}
${additionalInfo ? `Additional Information: ${additionalInfo}` : ""}

Please provide a comprehensive expert appraisal following the format in your instructions.`;
      
      // Start a chat with the model
      const chat = model.startChat({
        generationConfig,
        history: [],
      });
      
      // Create message parts array - putting images FIRST based on Gemini best practices
      let messageParts = [];
      
      // Add images first (Gemini docs suggest putting images before text for better results)
      for (const image of images) {
        messageParts.push({
          inlineData: {
            data: image.data,
            mimeType: image.mimeType
          }
        });
      }
      
      // Add text prompt after images
      messageParts.push(promptText);
      
      // Send message to Gemini
      const result = await chat.sendMessage(messageParts);
      
      // Get the response text
      const content = result.response.text();

      // Format the response as HTML for better presentation
      const formattedContent = content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^/, '<p>').replace(/$/, '</p>');

      return NextResponse.json({ content: formattedContent });
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      return NextResponse.json(
        { error: 'Failed to get analysis from Gemini' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in expert appraisal analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze with Expert Appraisal' },
      { status: 500 }
    );
  }
} 