import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initialize the Google Generative AI client with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || '');

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
    
    throw error;
  }
}

// Function to process the markdown response for better display
function processMarkdownResponse(content: string): string {
  // Remove any standard markdown error prefix that might show up
  const cleanContent = content.replace(/^```(\w+)?\n|```$/g, '');
  
  // Format markdown to HTML with proper styling
  return cleanContent
    // Handle main title
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-800 mb-6">$1</h1>')
    
    // Format section headings
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-800 pb-2 border-b border-slate-200">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-slate-700">$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-semibold mt-4 mb-2 text-slate-700">$1</h4>')
    
    // Handle bullet points and lists
    .replace(/^\s*[\*\-]\s+(.*$)/gm, '<li class="ml-4 my-1">$1</li>')
    .replace(/(<li.*<\/li>)\n(?![<\s]*li)/g, '<ul class="list-disc pl-5 my-3">$1</ul>')
    
    // Format tables - first, identify table sections
    .replace(/\|\s*([\s\S]*?)\s*\|/g, function(match) {
      // Process table rows
      const processed = match
        // Process table headers
        .replace(/\|\s*:?-+:?\s*\|/g, '')
        .replace(/\|(.+?)\|/g, '<tr><td class="border px-4 py-2">$1</td></tr>')
        .replace(/<td class="border px-4 py-2">(.+?)<\/td>/g, function(match, content) {
          return '<td class="border px-4 py-2">' + 
            content.replace(/\|/g, '</td><td class="border px-4 py-2">') + '</td>';
        });
      
      // Wrap in table tags
      return '<table class="min-w-full divide-y divide-gray-200 my-6">' + processed + '</table>';
    })
    
    // Bold and italics
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
    
    // Handle ordered lists
    .replace(/^\s*(\d+)\.\s+(.*$)/gm, '<li class="ml-4 my-1">$2</li>')
    .replace(/(<li.*<\/li>)\n(?![<\s]*li)/g, '<ol class="list-decimal pl-5 my-3">$1</ol>')
    
    // Format paragraphs
    .replace(/^(?!<[holtu]|<\/[holtu]|$)(.+)$/gm, '<p class="my-3 text-slate-600">$1</p>')
    
    // Fix any double-wrapped paragraphs
    .replace(/<p class="my-3 text-slate-600">(<h[1-4].*?<\/h[1-4]>)<\/p>/g, '$1')
    .replace(/<p class="my-3 text-slate-600">(<table.*?<\/table>)<\/p>/g, '$1')
    .replace(/<p class="my-3 text-slate-600">(<[ou]l.*?<\/[ou]l>)<\/p>/g, '$1')
    
    // Fix spacing
    .replace(/\n\n+/g, '\n\n');
}

export async function POST(request: NextRequest) {
  try {
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
      console.error('Error calling Gemini API:', apiError);
      return NextResponse.json(
        { error: 'Failed to get analysis from Gemini' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in appraise-v2 analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze with Gemini Appraisal' },
      { status: 500 }
    );
  }
}

// Helper functions to extract specific information from the markdown response
function extractTitle(content: string): string {
  const titleMatch = content.match(/# Valuation Report: (.*?)$/m);
  return titleMatch ? titleMatch[1].trim() : "Antique Item";
}

function extractCategory(content: string): string {
  // Try to extract from the title or description
  const titleMatch = content.match(/# Valuation Report: (.*?)$/m);
  const descMatch = content.match(/Description:\s*([^.]+)/);
  
  return titleMatch ? titleMatch[1].trim() : (descMatch ? descMatch[1].trim() : "Antique Item");
}

function extractSummary(content: string): string {
  // Extract from the Overview section
  const overviewMatch = content.match(/## 1\. Overview\s*\n\s*([\s\S]*?)(?=\n##|$)/);
  const descMatch = content.match(/Description:\s*([^.]+)/);
  
  return overviewMatch ? overviewMatch[1].trim().substring(0, 200) + "..." : 
    (descMatch ? descMatch[1].trim() : "Antique item with historical significance.");
}

function extractMaterials(content: string): string {
  const materialsMatch = content.match(/Materials\s*\|([^\|]+)/);
  return materialsMatch ? materialsMatch[1].trim() : "Not specified";
}

function extractSize(content: string): string {
  const sizeMatch = content.match(/Size\s*\|([^\|]+)/);
  return sizeMatch ? sizeMatch[1].trim() : "Not specified";
}

function extractCondition(content: string): string {
  const conditionMatch = content.match(/Object Condition:\s*([^.\n]+)/);
  return conditionMatch ? conditionMatch[1].trim() : "Condition unknown";
}

function extractNotableFeatures(content: string): string {
  const featuresMatch = content.match(/Notable Features\s*\|([^\|]+)/);
  return featuresMatch ? featuresMatch[1].trim() : "";
}

function extractStyle(content: string): string {
  const styleMatch = content.match(/Style:\s*([^.\n]+)/);
  return styleMatch ? styleMatch[1].trim() : "";
}

function extractEra(content: string): string {
  const eraMatch = content.match(/Era:\s*([^.\n]+)/);
  return eraMatch ? eraMatch[1].trim() : "Unknown era";
}

function extractValueFactors(content: string): string {
  const valFactorsMatch = content.match(/Influencing Factors:\s*([\s\S]*?)(?=\n\*|\n[A-Z]|$)/);
  return valFactorsMatch ? valFactorsMatch[1].trim() : "Various factors would affect valuation";
}

function extractConcerns(content: string): string {
  const concernsMatch = content.match(/Major Concerns:\s*([\s\S]*?)(?=\n\*|\n[A-Z]|$)/);
  return concernsMatch ? concernsMatch[1].trim() : "None identified in initial assessment";
} 