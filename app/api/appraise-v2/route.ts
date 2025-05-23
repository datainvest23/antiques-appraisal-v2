import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initialize the Google Generative AI client with API key
// IMPORTANT: Ensure GEMINI_API is set in your environment variables.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || ''); // Fallback to empty string if not set, though GenAI client will likely error.

// Service type definitions
type ServiceType = "basic" | "initial" | "full";

// System prompts for different service types
const SYSTEM_INSTRUCTIONS = {
  basic: `You are an expert in arts, history, and antiques. Your task is to analyze the provided image(s) of an object and create a basic categorization. Focus on identifying the type of antique, its approximate era, and primary materials. Keep your response brief and focused on these key aspects.`,
  
  initial: `You are an expert in arts, history, and antiques. Your task is to analyze the provided image(s) of an object and create an initial evaluation. Your analysis should include the type of antique, era, materials, condition assessment, style characteristics, and a rough estimate of value if possible. Provide enough detail for the user to understand the significance of their item without being exhaustive.`,
  
  full: `You are an expert in arts, history, and antiques. Your task is to analyze the provided image(s) of an object and create a detailed valuation report. The report must follow the structure below. Use your expertise to provide accurate, engaging, and informative content, incorporating specific terminology related to the object's category. Highlight unique attributes and note any limitations due to the image-based analysis, recommending physical inspection where necessary.

Valuation Report Structure
# Valuation Report: [Insert Object Name]

## 1. Overview

Provide a concise summary to give an immediate understanding of the object:

Description: Briefly describe the object (e.g., "A framed landscape painting attributed to Adolf Kaufmann").
Key Highlights: Note standout features (e.g., "Signed by the artist" or "Features a Qianlong mark").
Estimated Value Range: Offer a preliminary range, if feasible (e.g., "$500-$1,000, pending appraisal").
Major Concerns: Identify visible issues (e.g., "Frame shows wear" or "Material unclear").
Further Inspection Needed: Specify areas for physical review (e.g., "Condition details" or "Material verification").

## 2. Identification and Features Analysis

Detail the object's physical characteristics in a table:

Feature	Description
Shape	[e.g., "Rectangular canvas" or "Seated figurine"]
Size	[e.g., "20x30 inches" or "Approx. 8 inches tall"]
Colors	[e.g., "Blues and greens with gold accents" or "White with red highlights"]
Materials	[e.g., "Oil on canvas, wood frame" or "Possibly ivory and wood"]
Notable Features	[e.g., "Artist's signature in corner" or "Qianlong mark on base"]

## 3. Historical Context and Provenance

Provide historical and ownership background:

Origin: [e.g., "France" or "China"]
Era: [e.g., "19th century" or "Qing dynasty"]
Cultural/Historical Significance: [e.g., "Ties to Romanticism" or "Buddhist iconography"]
Provenance:
Artist/Creator: [e.g., "Adolf Kaufmann" or "Unknown artisan"]
Ownership History: [e.g., "Unknown" or "From a private collection"]

## 4. Artistic Aspects

Evaluate the object's artistic qualities:

Style: [e.g., "Impressionist" or "Classical Chinese"]
Composition: [e.g., "Balanced landscape" or "Harmonious figure"]
Craftsmanship: [e.g., "Detailed brushstrokes" or "Expert carving"]
Aesthetics: [e.g., "Vivid colors" or "Elegant patina"]

## 5. Condition Assessment

Assess the object's state based on the images:

Object Condition: [e.g., "Painting intact, frame worn" or "Minor surface wear"]
Image-Based Limitations: [e.g., "Fine cracks not visible" or "Texture unclear"]
Recommendations for Further Inspection: [e.g., "Check frame stability" or "Verify material"]

## 6. Valuation

Analyze factors affecting worth:

Influencing Factors: [e.g., "Artist reputation, condition" or "Rarity"]
Estimated Value Range: [e.g., "$500-$1,000" or "Dependent on authenticity"]
Market Considerations: [e.g., "Strong demand for 19th-century art" or "Legal restrictions"]

## 7. Legal Considerations (if applicable)

[Note relevant regulations, e.g., "Potential ivory content may fall under CITES; age verification required"]

## 8. Conclusion

Summarize key findings and suggest next steps:

Summary of Key Points:
Physical Characteristics: [e.g., "Oil painting with gilt frame" or "Carved figurine"]
Historical Significance: [e.g., "19th-century European" or "Qing-era Chinese"]
Artistic Merits: [e.g., "Fine technique" or "Intricate design"]
Condition: [e.g., "Stable with wear" or "Well-preserved"]
Value: [e.g., "Moderate, pending appraisal" or "High if authentic"]
Recommendations: [e.g., "Obtain professional appraisal" or "Confirm material legality"]

Additional Notes
Image Constraints: Acknowledge limitations of image analysis (e.g., inability to assess hidden damage) and recommend physical evaluation as needed.
Terminology: Use precise terms (e.g., "gesso" for paintings, "chasing" for metalwork) to reflect expertise.
Engagement: Craft descriptions that are both informative and compelling, emphasizing what makes the object special.`
};

// Helper function to fetch an image and convert it to a base64 string
async function fetchImageAsBase64(url: string): Promise<{data: string, mimeType: string}> {
  try {
    console.log('Fetching image from URL:', url);
    
    // Use additional fetch options to help with possible CORS or auth issues
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText || response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    // Convert ArrayBuffer to base64
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Get the mime type from the content-type header or default to image/jpeg
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log('Successfully converted image to base64');
    return {
      data: base64,
      mimeType: contentType
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    
    // Try to log more details about the URL for debugging
    try {
      const urlObj = new URL(url);
      console.log('URL details:', {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname
      });
    } catch (urlError) {
      console.error('Invalid URL format:', url);
    }
    
    // In case of an error, log the URL that caused the issue
    console.error(`Error fetching image from URL: ${url}`, error);
    // Propagate the error to be handled by the main try-catch block
    throw new Error(`Failed to fetch image at ${url}. Reason: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to process the markdown response for better display
// #############################################################################
// # IMPORTANT RECOMMENDATION:
// # Consider replacing this custom regex-based Markdown processing with a
// # well-tested third-party library like 'marked', 'showdown', or similar.
// # Such libraries are generally more robust, secure, and handle edge cases
// # much better than custom regex solutions. This would lead to more
// # reliable and maintainable code.
// #############################################################################
function processMarkdownResponse(content: string): string {
  // Remove Markdown code block fences (e.g., ```json ... ``` or ``` ... ```)
  // This is to clean up potential wrapping of the entire response in a code block.
  const cleanContent = content.replace(/^```(\w+)?\n([\s\S]*?)\n```$/g, '$2').replace(/^```\n([\s\S]*?)\n```$/g, '$1');

  // Format markdown to HTML with proper styling
  let htmlContent = cleanContent;

  // Handle main title (e.g., # Title)
  // Matches a line starting with '#' followed by a space and captures the title text.
  htmlContent = htmlContent.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-800 mb-6">$1</h1>');
    
  // Format section headings (e.g., ## Section, ### Subsection)
  // Matches lines starting with '##', '###', or '####' followed by a space.
  htmlContent = htmlContent.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-800 pb-2 border-b border-slate-200">$1</h2>');
  htmlContent = htmlContent.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-slate-700">$1</h3>');
  htmlContent = htmlContent.replace(/^#### (.*$)/gm, '<h4 class="text-lg font-semibold mt-4 mb-2 text-slate-700">$1</h4>');
    
  // Handle unordered lists (e.g., * item or - item)
  // Matches lines starting with optional whitespace, then '*' or '-', then a space.
  // It then wraps these list items with <ul> tags.
  // The lookahead `(?![<\s]*li)` ensures that consecutive list items are grouped into the same <ul>.
  htmlContent = htmlContent.replace(/^\s*[\*\-]\s+(.*$)/gm, '<li class="ml-4 my-1">$1</li>');
  htmlContent = htmlContent.replace(/(<li class="ml-4 my-1">.*?<\/li>)(?=\s*<li class="ml-4 my-1">|<\/ul>|$)/gs, '$1'); // Consolidate list items
  htmlContent = htmlContent.replace(/(<li class="ml-4 my-1">.*?<\/li>)+/gs, (match) => `<ul class="list-disc pl-5 my-3">${match}</ul>`);
  
  // Handle ordered lists (e.g., 1. item)
  // Matches lines starting with optional whitespace, digits, a period, then a space.
  // Similar to unordered lists, it wraps these in <ol> tags.
  htmlContent = htmlContent.replace(/^\s*(\d+)\.\s+(.*$)/gm, '<li class="ml-4 my-1" value="$1">$2</li>');
  htmlContent = htmlContent.replace(/(<li class="ml-4 my-1" value="\d+">.*?<\/li>)(?=\s*<li class="ml-4 my-1" value="\d+">|<\/ol>|$)/gs, '$1'); // Consolidate list items
  htmlContent = htmlContent.replace(/(<li class="ml-4 my-1" value="\d+">.*?<\/li>)+/gs, (match) => `<ol class="list-decimal pl-5 my-3">${match}</ol>`);

  // Format tables (Markdown table syntax)
  // This regex is complex. It attempts to find Markdown table structures.
  // - It looks for a header row (e.g., | Header1 | Header2 |)
  // - Then a separator row (e.g., |:---|:---:|)
  // - Then multiple body rows (e.g., | Cell1 | Cell2 |)
  // It's generally one of the most complex parts of Markdown to parse with regex.
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
    
  // Bold text (e.g., **text**)
  // Matches text surrounded by double asterisks.
  htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  
  // Italic text (e.g., *text*)
  // Matches text surrounded by single asterisks.
  // This needs to be carefully ordered with bold, or use more specific regex to avoid conflicts.
  htmlContent = htmlContent.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic text-slate-700">$1</em>');
    
  // Format paragraphs
  // Matches lines that don't start with HTML tags (h, ol, ul, table, div) or aren't empty.
  // This is a broad match and should generally come after more specific block-level elements.
  htmlContent = htmlContent.replace(/^(?!<(?:h[1-4]|ul|ol|li|table|thead|tbody|tr|th|td|div|\/h[1-4]|\/ul|\/ol|\/li|\/table|\/thead|\/tbody|\/tr|\/th|\/td|\/div)|^\s*$)(.+)$/gm, '<p class="my-3 text-slate-600">$1</p>');
    
  // Remove <p> tags wrapping block elements that were incorrectly added
  // This cleans up cases where the paragraph regex might have wrapped headings or tables.
  htmlContent = htmlContent.replace(/<p class="my-3 text-slate-600">\s*(<(h[1-4]|ul|ol|table|div class="overflow-x-auto").*?>[\s\S]*?<\/(h[1-4]|ul|ol|table|div)>)\s*<\/p>/g, '$1');
    
  // Clean up extra newlines to avoid excessive spacing
  htmlContent = htmlContent.replace(/\n\s*\n/g, '\n');

  return htmlContent;
}

export async function POST(request: NextRequest) {
  // RECOMMENDATION: Implement input validation for the request body (e.g., using Zod or a similar library)
  // to ensure 'imageUrls', 'additionalInfo', 'serviceType', etc., are present and correctly typed.
  try {
    // Log when the request is received
    console.log(`Received request for Gemini v2 appraisal: ${request.url}`);

    // Create a Supabase client for the route handler
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the authenticated user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    // Require authentication
    if (authError || !userData.user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: 'You must be logged in to analyze images.' 
      }, { status: 401 });
    }
    
    // Use authenticated user ID
    const userId = userData.user.id;
    
    const body = await request.json();
    const { imageUrls, additionalInfo, serviceType = "full" } = body;

    if (!imageUrls || !imageUrls.length) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    try {
      // Get the appropriate system instruction based on service type
      const systemInstruction = SYSTEM_INSTRUCTIONS[serviceType as ServiceType] || SYSTEM_INSTRUCTIONS.full;
      
      // Initialize the model with system instructions
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
        systemInstruction: systemInstruction,
      });

      // Define generation configuration - adjust based on service type
      const generationConfig = {
        temperature: serviceType === "basic" ? 0.7 : 1,
        topP: 0.95,
        topK: 64,
        // Use different token limits for different service types
        maxOutputTokens: serviceType === "basic" ? 2048 : 
                         serviceType === "initial" ? 4096 : 8192,
      };

      // Fetch and convert all images to base64
      const imagePromises = imageUrls.map((url: string) => fetchImageAsBase64(url));
      const images = await Promise.all(imagePromises);
      
      // Create the prompt text based on service type
      let promptText = "";
      
      switch (serviceType) {
        case "basic":
          promptText = `Please provide a basic categorization of this antique item. Focus on identifying what it is, its approximate time period, and primary materials.${additionalInfo ? ` Additional information: ${additionalInfo}` : ""}`;
          break;
        case "initial":
          promptText = `Please provide an initial evaluation of this antique item. Include information about the type, era, style, condition, and approximate value if possible.${additionalInfo ? ` Additional information: ${additionalInfo}` : ""}`;
          break;
        default: // full
          promptText = `Please analyze this antique item in detail and create a valuation report following the provided structure.${additionalInfo ? ` Additional information provided by the owner: ${additionalInfo}` : ""}`;
      }
      
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

      // Process the markdown response for better display
      const formattedContent = processMarkdownResponse(content);

      // For basic and initial service types, return a simplified response
      if (serviceType === "basic" || serviceType === "initial") {
        return NextResponse.json({
          content: formattedContent,
          raw_content: content,
          serviceType
        });
      }

      // For full service type, convert the Gemini output to the format expected by the frontend
      const analysisResult = {
        content: formattedContent,
        raw_content: content,
        preliminaryCategory: extractCategory(content),
        summary: extractSummary(content),
        introduction: {
          title: extractTitle(content)
        },
        fullReport: content,
        physicalAttributes: {
          materials: extractMaterials(content),
          measurements: extractSize(content),
          condition: extractCondition(content),
          priority: "",
          status: ""
        },
        inscriptions: {
          signatures: "",
          hallmarks: "",
          additionalIdentifiers: extractNotableFeatures(content)
        },
        stylistic: {
          indicators: extractStyle(content),
          estimatedEra: extractEra(content),
          confidenceLevel: "High"
        },
        valueIndicators: {
          factors: extractValueFactors(content),
          redFlags: extractConcerns(content)
        }
      };

      return NextResponse.json(analysisResult);
    } catch (apiError) {
      // Log the error and the raw response if available
      console.error('Error calling Gemini API or processing its response:', apiError);
      if (apiError instanceof Error && (apiError as any).response) {
        console.error("Gemini API Error Response:", (apiError as any).response);
      } else if (content) { // If content was fetched but processing failed
        console.error("Raw Gemini response (on processing error):", content.substring(0, 1000) + (content.length > 1000 ? "..." : ""));
      }

      // Determine the status code and message based on the error
      let errorMessage = 'Failed to get analysis from Gemini.';
      let errorDetails = 'The AI service encountered an issue.';
      let statusCode = 500;

      if (apiError instanceof Error) {
        errorDetails = apiError.message; // Use the actual error message for details
        if (apiError.message.toLowerCase().includes('timeout')) {
          statusCode = 504; // Gateway Timeout
          errorMessage = 'Analysis request timed out.';
        } else if (apiError.message.toLowerCase().includes('invalid api key')) {
          statusCode = 500; // Internal Server Error (as key is server-side)
          errorMessage = 'AI service configuration error.';
          errorDetails = 'There is an issue with the server configuration for the AI service.'; // More user-friendly detail
        } else if (apiError.message.toLowerCase().includes('bad request') || apiError.message.toLowerCase().includes('invalid argument')) {
          statusCode = 400; // Bad Request
          errorMessage = 'Invalid request to AI service.';
          errorDetails = 'The data sent for analysis was not accepted by the AI service. This might be due to image format or prompt issues.';
        }
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorDetails },
        { status: statusCode }
      );
    }
  } catch (error) { // Catch-all for other errors, like Supabase auth or request parsing
    console.error('Unhandled error in appraise-v2 analysis POST handler:', error);
    
    let errorMessage = 'Failed to analyze with Gemini Appraisal.';
    let errorDetails = 'An unexpected server error occurred.';
    let statusCode = 500;

    if (error instanceof Error) {
        errorDetails = error.message;
        if (error.message.includes('Authentication required')) {
            errorMessage = 'Authentication Failed.';
            statusCode = 401;
        } else if (error.message.includes('No images provided') || error.message.includes('Invalid image URL')) {
            errorMessage = 'Invalid Input.';
            statusCode = 400;
        }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
}

// #############################################################################
// # RECOMMENDATION FOR FUTURE PROMPTING (for more reliable data extraction):
// # To make data extraction significantly more robust, the Gemini prompt
// # should be modified to request structured information (like physical
// # attributes, era, value factors) as a JSON object within a specific part
// # of the markdown response. For example, ask Gemini to include a block like:
// # ```json
// # {
// #   "materials": "Oil on canvas",
// #   "era": "19th Century",
// #   ...
// # }
// # ```
// # This JSON block can then be parsed directly, avoiding fragile regex.
// #############################################################################

// Helper functions to extract specific information from the markdown response.
// Each function attempts to match a pattern and returns a default value if not found.
// Warnings are logged when patterns are not found to help identify changes in Gemini's output structure.

function extractTitle(content: string): string {
  // Matches the main title of the valuation report.
  const titleMatch = content.match(/^# Valuation Report:\s*(.*?)$/im);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  console.warn("extractTitle: Title pattern not found. Using default. Content snippet:", content.substring(0, 200));
  return "Antique Item Analysis";
}

function extractCategory(content: string): string {
  // Attempts to get category from "Description" or "Object Type" in the overview or features table.
  // Regex looks for "Description:" or "Object Type:" followed by its value.
  let match = content.match(/Description:\s*([^\r\n.]+)/i);
  if (match && match[1]) return match[1].trim();
  
  match = content.match(/Object Type\s*\|\s*([^\|\r\n]+)/i); // From table
  if (match && match[1]) return match[1].trim();

  // Fallback to title if specific category line not found
  const title = extractTitle(content);
  if (title !== "Antique Item Analysis") return title; // Use extracted title if it's not the default

  console.warn("extractCategory: Category pattern not found. Using default. Content snippet:", content.substring(0, 300));
  return "General Antique";
}

function extractSummary(content: string): string {
  // Extracts summary from "## 1. Overview" section or "Description:"
  // This regex looks for the content under "## 1. Overview" until the next heading or end of string.
  const overviewMatch = content.match(/##\s*1\.\s*Overview\s*([\s\S]*?)(?=\n##\s*\d\.|\n<h[1-2]>|$)/i);
  if (overviewMatch && overviewMatch[1]) {
    // Further refine to get a concise summary, e.g., the first paragraph or a few lines.
    const firstParagraph = overviewMatch[1].match(/^\s*([^\r\n]+(?:\r?\n[^\r\n]+){0,2})/); // Gets first few lines
    if (firstParagraph && firstParagraph[1]) return firstParagraph[1].trim().substring(0, 300) + (firstParagraph[1].length > 300 ? "..." : "");
    return overviewMatch[1].trim().substring(0, 300) + (overviewMatch[1].length > 300 ? "..." : "");
  }
  
  const descMatch = content.match(/Description:\s*([^\r\n.]+)/i);
  if (descMatch && descMatch[1]) return descMatch[1].trim().substring(0, 250) + (descMatch[1].length > 250 ? "..." : "");

  console.warn("extractSummary: Summary pattern not found. Using default. Content snippet:", content.substring(0, 400));
  return "An antique item of potential historical and artistic interest.";
}

function extractMaterials(content: string): string {
  // Looks for "Materials" in a table row or as a bolded label.
  // `Materials\s*\|\s*([^\|\r\n]+)` for table format.
  // `\*\*Materials:\*\*\s*([^\r\n]+)` for " **Materials:** value " format.
  const tableMatch = content.match(/Materials\s*\|\s*([^\|\r\n]+)/i);
  if (tableMatch && tableMatch[1]) return tableMatch[1].trim();
  
  const labelMatch = content.match(/\*\*Materials:\*\*\s*([^\r\n]+)/i);
  if (labelMatch && labelMatch[1]) return labelMatch[1].trim();

  console.warn("extractMaterials: Materials pattern not found. Using default. Searched snippet:", content.match(/materials/i) ? content.substring(content.search(/materials/i)-50, content.search(/materials/i)+150) : "N/A");
  return "Not specified";
}

function extractSize(content: string): string {
  // Looks for "Size" in a table row or as a bolded label.
  const tableMatch = content.match(/Size\s*\|\s*([^\|\r\n]+)/i);
  if (tableMatch && tableMatch[1]) return tableMatch[1].trim();

  const labelMatch = content.match(/\*\*Size:\*\*\s*([^\r\n]+)/i);
  if (labelMatch && labelMatch[1]) return labelMatch[1].trim();
  
  console.warn("extractSize: Size pattern not found. Using default. Searched snippet:", content.match(/size/i) ? content.substring(content.search(/size/i)-50, content.search(/size/i)+150) : "N/A");
  return "Not specified";
}

function extractCondition(content: string): string {
  // Looks for "Object Condition:" or "Condition:" as a label.
  // `(?:Object\s)?Condition:\s*([^\r\n.]+)` captures value after "Condition:" or "Object Condition:".
  const conditionMatch = content.match(/(?:\*\*Object\sCondition:\*\*|\*\*Condition:\*\*|Object Condition:)\s*([^\r\n.]+)/i);
  if (conditionMatch && conditionMatch[1]) return conditionMatch[1].trim();
  
  console.warn("extractCondition: Condition pattern not found. Using default. Searched snippet:", content.match(/condition/i) ? content.substring(content.search(/condition/i)-50, content.search(/condition/i)+150) : "N/A");
  return "Not specified";
}

function extractNotableFeatures(content: string): string {
  // Looks for "Notable Features" in a table or as a label.
  const tableMatch = content.match(/Notable Features\s*\|\s*([^\|\r\n]+)/i);
  if (tableMatch && tableMatch[1]) return tableMatch[1].trim();
  
  const labelMatch = content.match(/\*\*Notable Features:\*\*\s*([^\r\n]+)/i);
  if (labelMatch && labelMatch[1]) return labelMatch[1].trim();

  console.warn("extractNotableFeatures: Notable Features pattern not found. Defaulting to empty string. Searched snippet:", content.match(/notable features/i) ? content.substring(content.search(/notable features/i)-50, content.search(/notable features/i)+150) : "N/A");
  return ""; // Default to empty string as it's often supplementary.
}

function extractStyle(content: string): string {
  // Looks for "Style:" as a label.
  const styleMatch = content.match(/(?:\*\*Style:\*\*|Style:)\s*([^\r\n.]+)/i);
  if (styleMatch && styleMatch[1]) return styleMatch[1].trim();
  
  console.warn("extractStyle: Style pattern not found. Defaulting to empty string. Searched snippet:", content.match(/style/i) ? content.substring(content.search(/style/i)-50, content.search(/style/i)+150) : "N/A");
  return ""; // Default to empty string as it might not always be present or easily identifiable.
}

function extractEra(content: string): string {
  // Looks for "Era:" as a label.
  const eraMatch = content.match(/(?:\*\*Era:\*\*|Era:)\s*([^\r\n.]+)/i);
  if (eraMatch && eraMatch[1]) return eraMatch[1].trim();
  
  console.warn("extractEra: Era pattern not found. Using default. Searched snippet:", content.match(/era/i) ? content.substring(content.search(/era/i)-50, content.search(/era/i)+150) : "N/A");
  return "Unknown era";
}

function extractValueFactors(content: string): string {
  // Looks for "Influencing Factors:" or "Value Drivers:" as a label.
  // `(?:Influencing Factors:|Value Drivers:)\s*([\s\S]*?)(?=\n\s*\n|\n##|\n<h[1-2]>|$)` captures multi-line text until a blank line or next heading.
  const factorsMatch = content.match(/(?:\*\*Influencing Factors:\*\*|\*\*Value Drivers:\*\*|Influencing Factors:|Value Drivers:)\s*([\s\S]*?)(?=\n\s*\n|\n##|\n<h[1-2]>|$)/i);
  if (factorsMatch && factorsMatch[1]) return factorsMatch[1].trim().replace(/\n\* /g, '\n• '); // Replace markdown list with bullets
  
  console.warn("extractValueFactors: Value Factors pattern not found. Using default. Searched snippet:", content.match(/factor|driver/i) ? content.substring(content.search(/factor|driver/i)-50, content.search(/factor|driver/i)+150) : "N/A");
  return "Market demand, condition, rarity, and provenance typically influence value.";
}

function extractConcerns(content: string): string {
  // Looks for "Major Concerns:" or "Condition Issues:" as a label.
  const concernsMatch = content.match(/(?:\*\*Major Concerns:\*\*|\*\*Condition Issues:\*\*|Major Concerns:|Condition Issues:)\s*([\s\S]*?)(?=\n\s*\n|\n##|\n<h[1-2]>|$)/i);
  if (concernsMatch && concernsMatch[1]) return concernsMatch[1].trim().replace(/\n\* /g, '\n• ');
  
  console.warn("extractConcerns: Concerns pattern not found. Using default. Searched snippet:", content.match(/concern|issue/i) ? content.substring(content.search(/concern|issue/i)-50, content.search(/concern|issue/i)+150) : "N/A");
  return "Further inspection is recommended to fully assess condition.";
} 