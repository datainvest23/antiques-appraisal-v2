import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
// Use dynamic import for node-fetch instead
// import fetch from 'node-fetch';

// Initialize the Google Generative AI client with API key
// IMPORTANT: Ensure GEMINI_API is set in your environment variables.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || ''); // Fallback to empty string if not set, though GenAI client will likely error.

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
    // In case of an error, log the URL that caused the issue
    console.error(`Error fetching image from URL: ${url}`, error);
    // Propagate the error to be handled by the main try-catch block
    throw new Error(`Failed to fetch image at ${url}. Reason: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to clean up and process Gemini's markdown response
// #############################################################################
// # IMPORTANT RECOMMENDATION:
// # Consider replacing this custom regex-based Markdown processing with a
// # well-tested third-party library like 'marked', 'showdown', or similar.
// # Such libraries are generally more robust, secure, and handle edge cases
// # much better than custom regex solutions. This would lead to more
// # reliable and maintainable code.
// #############################################################################
function processMarkdownResponse(content: string): string {
  // Remove any content before the Executive Summary section, if present
  // This helps to standardize the starting point of the content to be processed.
  let cleanedContent = content;
  const execSummaryIndex = cleanedContent.indexOf('## EXECUTIVE SUMMARY');
  if (execSummaryIndex > 0) { // Only substring if it's not at the very beginning (or -1)
    cleanedContent = cleanedContent.substring(execSummaryIndex);
  } else if (execSummaryIndex === -1) {
    console.warn("processMarkdownResponse: '## EXECUTIVE SUMMARY' not found. Processing entire content.");
  }
  
  // Remove Markdown code block fences (e.g., ```json ... ``` or ``` ... ```)
  // This is to clean up potential wrapping of the entire response or parts of it in code blocks.
  cleanedContent = cleanedContent.replace(/^```(\w+)?\n([\s\S]*?)\n```$/gm, '$2').replace(/^```\n([\s\S]*?)\n```$/gm, '$1');

  // Format markdown to HTML with proper classes for styling
  let htmlContent = cleanedContent;

  // Format headers (e.g., ## Title, ### Subtitle)
  // Matches lines starting with '##', '###', or '####'.
  htmlContent = htmlContent.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3 text-slate-800 pb-2 border-b border-slate-200">$1</h2>');
  htmlContent = htmlContent.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-5 mb-2 text-slate-700">$1</h3>');
  htmlContent = htmlContent.replace(/^#### (.*$)/gm, '<h4 class="text-lg font-semibold mt-4 mb-2 text-slate-700">$1</h4>');
  
  // Format unordered list items (e.g., - item or * item)
  // Matches lines starting with '-' or '*' followed by a space.
  // Then groups consecutive list items into a <ul>.
  htmlContent = htmlContent.replace(/^\s*[\*\-]\s+(.*$)/gm, '<li class="ml-4 my-1">$1</li>');
  htmlContent = htmlContent.replace(/(<li class="ml-4 my-1">.*?<\/li>)(?=\s*<li class="ml-4 my-1">|<\/ul>|$)/gs, '$1'); 
  htmlContent = htmlContent.replace(/(?:<li class="ml-4 my-1">.*?<\/li>)+/gs, (match) => `<ul class="list-disc pl-5 my-3">${match}</ul>`);

  // Format ordered list items (e.g., 1. item)
  // Matches lines starting with digits, a period, and a space.
  // Then groups consecutive list items into an <ol>.
  htmlContent = htmlContent.replace(/^\s*(\d+)\.\s+(.*$)/gm, '<li class="ml-4 my-1" value="$1">$2</li>');
  htmlContent = htmlContent.replace(/(<li class="ml-4 my-1" value="\d+">.*?<\/li>)(?=\s*<li class="ml-4 my-1" value="\d+">|<\/ol>|$)/gs, '$1');
  htmlContent = htmlContent.replace(/(?:<li class="ml-4 my-1" value="\d+">.*?<\/li>)+/gs, (match) => `<ol class="list-decimal pl-5 my-3">${match}</ol>`);
  
  // Format bold text (e.g., **text**)
  // Matches text surrounded by double asterisks.
  htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  
  // Format italic text (e.g., *text*)
  // Matches text surrounded by single asterisks (not part of a bold sequence).
  htmlContent = htmlContent.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic text-slate-700">$1</em>');
  
  // Format tables (Markdown table syntax)
  // This regex is complex:
  // - `^\|(.+)\|\s*\n` matches the header row.
  // - `\|([\s\S]+?)\|\s*\n` matches the separator row (e.g., |:---|:---:|).
  // - `((?:\|.*\|\s*\n?)+)` matches all body rows.
  htmlContent = htmlContent.replace(
    /^\|(.+)\|\s*\n\|([\s\S]+?)\|\s*\n((?:\|.*\|\s*\n?)+)/gm,
    (tableMatch, headerRow, separatorRow, bodyRows) => {
      const headers = headerRow.split('|').slice(1, -1).map(h => `<th class="border px-4 py-2 text-left">${h.trim()}</th>`).join('');
      
      const rows = bodyRows.trim().split('\n').map(row => {
        const cells = row.split('|').slice(1, -1).map(c => `<td class="border px-4 py-2">${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      return `<div class="overflow-x-auto my-6"><table class="min-w-full divide-y divide-gray-200 border border-slate-200 rounded-md shadow-sm"><thead><tr>${headers}</tr></thead><tbody class="divide-y divide-gray-200">${rows}</tbody></table></div>`;
    }
  );
  
  // Format paragraphs
  // Matches lines that are not headings, list items, or part of tables, and are not empty.
  // This should generally come after more specific block-level element processing.
  htmlContent = htmlContent.replace(/^(?!<(?:h[2-4]|ul|ol|li|table|thead|tbody|tr|th|td|div|\/h[2-4]|\/ul|\/ol|\/li|\/table|\/thead|\/tbody|\/tr|\/th|\/td|\/div)|^\s*$)(.+)$/gm, '<p class="my-2 text-slate-700">$1</p>');
  
  // Remove <p> tags that might have incorrectly wrapped block elements (headings, tables, lists).
  htmlContent = htmlContent.replace(/<p class="my-2 text-slate-700">\s*(<(h[2-4]|ul|ol|table|div class="overflow-x-auto").*?>[\s\S]*?<\/(h[2-4]|ul|ol|table|div)>)\s*<\/p>/g, '$1');
  
  // Handle horizontal rules (e.g., ---)
  // Matches lines consisting only of three or more hyphens.
  htmlContent = htmlContent.replace(/^---+\s*$/gm, '<hr class="my-6 border-t border-gray-300">');
  
  // Clean up multiple sequential newlines to single newlines for better spacing.
  htmlContent = htmlContent.replace(/\n\s*\n/g, '\n');
  
  // Wrap everything in a container div with consistent styling
  return `<div class="expert-appraisal-response text-gray-800 leading-relaxed">${htmlContent}</div>`;
}

export const POST = async (request: NextRequest) => {
  // RECOMMENDATION: Implement input validation for the request body (e.g., using Zod or a similar library)
  // to ensure 'imageUrls', 'category', 'summary', 'additionalInfo', 'analysisData', etc., are present and correctly typed.
  try {
    // Log when the request is received
    console.log(`Received request for expert appraisal: ${request.url}`);

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

      // Process the markdown response
      const formattedContent = processMarkdownResponse(content);

      // Log the successful response before sending
      console.log("Successfully processed expert appraisal. Sending formatted content to client.");
      return NextResponse.json({ content: formattedContent, raw_response: content });

    } catch (apiError) {
      // Log the error and the raw response if available
      console.error('Error calling Gemini API or processing its response in expert-appraisal:', apiError);
      if (apiError instanceof Error && (apiError as any).response) { // Check for Gemini API specific error structure
        console.error("Gemini API Error Response:", (apiError as any).response);
      } else if (typeof content === 'string' && content) { // If content was fetched but processing failed later
        console.error("Raw Gemini response (on processing error):", content.substring(0, 1000) + (content.length > 1000 ? "..." : ""));
      }
      
      let errorMessage = 'Failed to get expert analysis from Gemini.';
      let errorDetails = 'The AI service encountered an issue during the expert appraisal.';
      let statusCode = 500;

      if (apiError instanceof Error) {
        errorDetails = apiError.message; // Default to the error's message for details
        if (apiError.message.toLowerCase().includes('timeout')) {
          statusCode = 504; // Gateway Timeout
          errorMessage = 'Expert analysis request timed out.';
        } else if (apiError.message.toLowerCase().includes('invalid api key')) {
          statusCode = 500; // Internal Server Error (as key is server-side)
          errorMessage = 'AI service configuration error.';
          errorDetails = 'There is an issue with the server configuration for the AI service (expert appraisal).';
        } else if (apiError.message.toLowerCase().includes('bad request') || apiError.message.toLowerCase().includes('invalid argument')) {
          statusCode = 400; // Bad Request
          errorMessage = 'Invalid request to AI service for expert appraisal.';
          errorDetails = 'The data sent for expert analysis was not accepted. This might be due to image format or prompt issues.';
        }
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorDetails },
        { status: statusCode }
      );
    }
  } catch (error) { // Catch-all for other errors, like request parsing or image fetching before API call
    console.error('Unhandled error in expert-appraisal POST handler:', error);
    
    let errorMessage = 'Failed to process the expert appraisal request.';
    let errorDetails = 'An unexpected server error occurred before communicating with the AI service.';
    let statusCode = 500;

    if (error instanceof Error) {
        errorDetails = error.message; // Provide the actual error message for server logs / details
        if (error.message.includes('No images provided') || error.message.includes('Invalid image URL') || error.message.includes('Failed to fetch image')) {
            errorMessage = 'Invalid Input.';
            statusCode = 400;
        }
        // Note: Authentication errors should ideally be handled by middleware or a dedicated auth check earlier.
        // If an auth error somehow reaches here, it would be a generic 500.
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
} 