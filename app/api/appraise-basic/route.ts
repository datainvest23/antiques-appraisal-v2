import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

// Initialize OpenAI client
// IMPORTANT: Ensure OPENAI_API_KEY is set in your environment variables.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Fallback to empty string if not set, though OpenAI client will likely error.
});

// Process the markdown response for better display
function processMarkdownResponse(content: string): string {
  // Process headings (## Heading -> <h2>Heading</h2>)
  let formattedContent = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  formattedContent = formattedContent.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  formattedContent = formattedContent.replace(/^#### (.*$)/gm, '<h4>$1</h4>');

  // Process lists (- item -> <li>item</li>)
  formattedContent = formattedContent.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
  
  // Wrap lists with <ul></ul>
  formattedContent = formattedContent.replace(/(<li>.*<\/li>)\s*\n\s*\n/gs, '<ul>$1</ul>\n\n');
  
  // Process tables - capture the entire table and wrap it in a scrollable div
  formattedContent = formattedContent.replace(
    /\|(.*)\|\s*\n\|[-:|]+\|\s*\n((\|.*\|\s*\n)+)/g,
    (match, headerRow, bodyRows) => {
      const headers = headerRow.split('|').filter((cell: string) => cell.trim()).map((cell: string) => `<th>${cell.trim()}</th>`).join('');
      
      const rows = bodyRows.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((cell: string) => cell.trim()).map((cell: string) => `<td>${cell.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      
      return `<div class="overflow-x-auto my-4 border border-slate-200 rounded-md shadow-sm">
        <table class="min-w-full">
          <thead>
            <tr>${headers}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>`;
    }
  );
  
  // Process paragraphs (separated by blank lines)
  formattedContent = formattedContent.replace(/^(?!<[hlu]|<div class="overflow).+/gm, '<p>$&</p>');
  
  // Process bold text (**text** -> <strong>text</strong>)
  formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Process italic text (*text* -> <em>text</em>)
  formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return formattedContent;
}

// Format the response from the Assistants API to HTML for display
function formatAssistantResponse(response: any): string {
  if (!response) return "<p>No analysis generated</p>";
  
  try {
    console.log("Formatting response:", JSON.stringify(response, null, 2));
    
    // Create a title header
    let formattedContent = `<h1 class="text-center font-bold mb-6">Antique Valuation Report</h1>`;
    
    // Overview Section - check if exists
    if (response.overview) {
      formattedContent += `<h2>Overview</h2>`;
      formattedContent += `<p>${response.overview}</p>`;
    } else {
      formattedContent += `<h2>Overview</h2>`;
      formattedContent += `<p>No overview information available.</p>`;
    }
    
    // Features Analysis Section
    formattedContent += `<h2>Identification and Features Analysis</h2>`;
    
    // Object type and description first
    if (response.features && response.features.object_type) {
      formattedContent += `<p><strong>Object Type:</strong> ${response.features.object_type}</p>`;
    }
    
    if (response.features && response.features.description) {
      formattedContent += `<p><strong>Description:</strong> ${response.features.description}</p>`;
    }
    
    // Create a table for the features
    if (response.features) {
      formattedContent += `<div class="overflow-x-auto my-4 border border-slate-200 rounded-md shadow-sm">
        <table class="min-w-full">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>`;
          
      // Add rows for each feature if present
      const featureMap = {
        "Shape": response.features.shape,
        "Size": response.features.size,
        "Colors": response.features.colors,
        "Materials": response.features.materials,
        "Notable Features": response.features.notable_features,
        "Key Highlights": response.features.key_highlights,
        "Major Concerns": response.features.major_concerns
      };
      
      // Add a row for each feature that exists
      Object.entries(featureMap).forEach(([key, value]) => {
        if (value) {
          formattedContent += `<tr>
            <td>${key}</td>
            <td>${value}</td>
          </tr>`;
        }
      });
      
      formattedContent += `</tbody>
        </table>
      </div>`;
    } else {
      formattedContent += `<p>No features information available.</p>`;
    }

    // Legal Considerations Section
    formattedContent += `<h2>Legal Considerations</h2>`;
    
    if (response.legal_considerations && response.legal_considerations.regulations) {
      formattedContent += `<p><strong>Regulations:</strong> ${response.legal_considerations.regulations}</p>`;
    } else {
      formattedContent += `<p><strong>Regulations:</strong> No specific regulations identified.</p>`;
    }
    
    if (response.legal_considerations && response.legal_considerations.further_inspection_needed) {
      formattedContent += `<p><strong>Further Inspection Needed:</strong> ${response.legal_considerations.further_inspection_needed}</p>`;
    } else {
      formattedContent += `<p><strong>Further Inspection Needed:</strong> A professional appraisal is recommended for complete valuation.</p>`;
    }
    
    // Conclusion Section
    formattedContent += `<h2>Conclusion</h2>`;
    
    if (response.conclusion) {
      formattedContent += `<p>${response.conclusion}</p>`;
    } else {
      formattedContent += `<p>Based on the provided images, this appears to be an interesting antique. For a more detailed analysis and accurate valuation, consider our Initial or Full appraisal services.</p>`;
    }
    
    return formattedContent;
  } catch (error) {
    console.error("Error formatting assistant response:", error);
    // Provide a simple formatted response even if there's an error
    return `
      <h1 class="text-center font-bold mb-6">Antique Valuation Report</h1>
      <h2>Overview</h2>
      <p>${response.overview || "An error occurred while analyzing your item."}</p>
      <h2>Conclusion</h2>
      <p>We encountered an issue while processing your appraisal. Please try again with clearer images or contact support if the problem persists.</p>
    `;
  }
}

// Helper function to extract text sections from unstructured text
function extractFromText(text: string, pattern: RegExp, defaultValue: string): string {
  try {
    const match = text.match(new RegExp(`(${pattern.source})(?:\\s*:\\s*|\\s+)([^\\n.]+(?:[\\n.](?![\\n.])[^\\n.]+)*)`, 'i'));
    if (match && match[2]) {
      return match[2].trim();
    }
    
    // Try to find a sentence containing the pattern
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (pattern.test(sentence)) {
        return sentence.trim();
      }
    }
    
    return defaultValue;
  } catch (error) {
    console.error(`Error extracting ${pattern.source} from text:`, error);
    return defaultValue;
  }
}

// Use the Assistants API to analyze the images
async function analyzeWithAssistant(imageUrls: string[], additionalInfo: string) {
  try {
    // Step 1: Create a Thread
    const thread = await openai.beta.threads.create();
    
    // Step 2: Add the user's message with images to the thread
    const userMessage = additionalInfo 
      ? `Please analyze these antique images. Additional information: ${additionalInfo}` 
      : 'Please analyze these antique images.';
    
    const userMessageContent: any[] = [
      {
        type: "text",
        text: userMessage
      }
    ];
    
    // Add image content for each image URL
    for (const imageUrl of imageUrls) {
      userMessageContent.push({
        type: "image_url",
        image_url: { url: imageUrl }
      });
    }
    
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessageContent,
    });
    
    // Step 3: Run the Assistant on the Thread
    // IMPORTANT: Ensure OPENAI_ASSISTANT_ID_BASIC is set for this 'basic' appraisal type.
    const assistantId = process.env.OPENAI_ASSISTANT_ID_BASIC;
    if (!assistantId) {
      console.error("CRITICAL: OPENAI_ASSISTANT_ID_BASIC is not configured in environment variables.");
      throw new Error("Assistant ID for basic appraisal is not configured. This service cannot proceed.");
    }
    
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId, // Already checked for null/undefined
    });
    
    // Step 4: Poll for the completion of the Run
    let completedRun;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
      const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      if (runStatus.status === "completed") {
        completedRun = runStatus;
        break;
      } else if (runStatus.status === "failed" || runStatus.status === "cancelled" || runStatus.status === "expired") {
        throw new Error(`Run ended with status: ${runStatus.status}`);
      }
      
      // Wait for 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    if (!completedRun) {
      throw new Error("Analysis timed out after 5 minutes");
    }
    
    // Step 5: Retrieve the Assistant's messages
    const messages = await openai.beta.threads.messages.list(thread.id, {
      order: "desc", // Get the most recent message first
      limit: 1,
    });
    
    // Get the latest message from the assistant
    const latestMessage = messages.data.find(msg => msg.role === "assistant");
    if (!latestMessage) {
      throw new Error("No response from Assistant");
    }
    
    // Extract the content from the message
    const messageContents = latestMessage.content;
    console.log("Assistant response content:", JSON.stringify(messageContents, null, 2));
    
    // Find the text content
    const textContent = messageContents.find((content: any) => content.type === "text");
    if (!textContent || !("text" in textContent)) {
      throw new Error("No text content in Assistant's response");
    }
    
    // Log the text content for debugging
    console.log("Text content from Assistant:", textContent.text.value);
    
    // Parse the response - it should be a JSON object following our schema
    let parsedResponse;
    try {
      // Look for JSON structure in the response
      const jsonMatch = textContent.text.value.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        console.log("Found JSON in code block:", jsonMatch[1]);
        try {
          parsedResponse = JSON.parse(jsonMatch[1]);
          console.log("Successfully parsed JSON from code block");
        } catch (parseJsonError) {
          console.error("Error parsing JSON from code block:", parseJsonError);
          throw new Error("Invalid JSON format in code block");
        }
      } else {
        // Try to parse the entire response as JSON
        try {
          parsedResponse = JSON.parse(textContent.text.value);
          console.log("Parsed entire response as JSON");
        } catch (parseError) {
          console.error("Error parsing entire response as JSON:", parseError);
          
          // Fallback: Let's create a structured response from the text to avoid breaking the UI
          console.log("Creating fallback response from text");
          const responseText = textContent.text.value;
          
          // Create a structured response from raw text
          parsedResponse = {
            overview: responseText.substring(0, 800), // First part as overview
            features: {
              object_type: extractFromText(responseText, /object\s*type|item\s*type|type\s*of\s*object/i, "Unknown object"),
              shape: extractFromText(responseText, /shape|form|figure/i, "Not specified"),
              size: extractFromText(responseText, /size|dimension|measurement/i, "Not specified"),
              colors: extractFromText(responseText, /color|hue|tone/i, "Not specified"),
              materials: extractFromText(responseText, /material|substance|composition/i, "Not specified"),
              notable_features: extractFromText(responseText, /notable|special|unique|feature/i, "Not specified"), 
              description: extractFromText(responseText, /description|appearance|look/i, "See overview for details"),
              key_highlights: extractFromText(responseText, /highlight|key|important/i, "Not specified"),
              major_concerns: extractFromText(responseText, /concern|issue|problem|damage/i, "Not specified")
            },
            legal_considerations: {
              regulations: extractFromText(responseText, /regulation|legal|law|restriction/i, "None specified"),
              further_inspection_needed: "Professional appraisal recommended for detailed valuation."
            },
            conclusion: extractFromText(responseText, /conclusion|summary|final/i, 
              "Based on the provided images, this appears to be an interesting antique item. For a more accurate valuation, consider using our Initial or Full appraisal services, or consult with a professional appraiser.")
          };
        }
      }
    } catch (error) {
      console.error("Error processing Assistant response:", error);
      // Create a minimal valid response to prevent UI breakage
      parsedResponse = {
        overview: "We encountered an error analyzing your item. The AI model may need more clear images or additional context.",
        features: {
          object_type: "Unknown",
          shape: "Not specified",
          size: "Not specified",
          colors: "Not specified",
          materials: "Not specified",
          notable_features: "Not specified",
          description: "Unable to provide a detailed description due to processing error.",
          key_highlights: "Not specified",
          major_concerns: "Analysis error"
        },
        legal_considerations: {
          regulations: "None specified",
          further_inspection_needed: "Professional appraisal recommended"
        },
        conclusion: "We apologize, but we couldn't complete the analysis of your item. Please try again with clearer images or consider our Initial or Full appraisal options."
      };
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error using Assistants API:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  // RECOMMENDATION: Implement input validation for the request body (e.g., using Zod or a similar library)
  // to ensure 'imageUrls', 'additionalInfo', etc., are present and correctly typed.
  try {
    // Log when the request is received
    console.log(`Received request for basic appraisal: ${request.url}`);

    // Create a Supabase client for the route handler
    // Using the recommended pattern from Next.js docs
    const cookieStore = cookies();
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
    const { imageUrls, additionalInfo } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input.', details: 'Image URLs must be an array and cannot be empty.' },
        { status: 400 }
      );
    }

    // Call the assistant for analysis
    const assistantResponse = await analyzeWithAssistant(imageUrls, additionalInfo || "");
    
    // Format the response for display
    // This function now includes its own error handling for formatting issues
    const formattedContent = formatAssistantResponse(assistantResponse);
    
    // Save the analysis to Supabase
    // This operation is wrapped in a try-catch to prevent it from blocking the response to the user.
    try {
      const { error: insertError } = await supabase
        .from('analyses')
        .insert({
          user_id: userId, // Ensure user_id is correctly passed
          analysis_type: 'basic',
          result: JSON.stringify(assistantResponse), // Store the raw JSON response
          images: imageUrls
        });

      if (insertError) {
        // Log the error but don't let it break the user response
        console.error('Supabase insert error:', insertError);
      }
    } catch (dbError) {
      console.error('Error saving analysis to database:', dbError);
      // Non-critical error, so we just log it and continue.
    }

    // Return the successful response
    return NextResponse.json({
      content: formattedContent,
      images: imageUrls,
      raw_response: assistantResponse,
      has_content: !!formattedContent, // Ensure this reflects actual content
      service_type: 'basic'
    });
      
  } catch (error) {
    // Centralized error handling for the POST request
    console.error('Error in appraise-basic POST handler:', error);

    let errorMessage = 'Failed to process your request.';
    let errorDetails = 'An unexpected error occurred.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorDetails = error.message; // Default to the error's message
      if (error.message.includes('Authentication required')) {
        errorMessage = 'Authentication Failed.';
        statusCode = 401;
      } else if (error.message.includes('No images provided') || error.message.includes('Invalid input')) {
        errorMessage = 'Invalid Input.';
        statusCode = 400;
      } else if (error.message.includes('Analysis timed out') || error.message.includes('No response from Assistant')) {
        errorMessage = 'Analysis Service Error.';
        errorDetails = 'The analysis service took too long to respond or returned no data.';
        statusCode = 504; // Gateway Timeout
      } else if (error.message.includes('Invalid JSON format') || error.message.includes('No text content in Assistant')) {
        errorMessage = 'Data Processing Error.';
        errorDetails = 'The analysis service returned data in an unexpected format.';
        statusCode = 502; // Bad Gateway
      }
      // For other generic errors, the default messages are used.
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails // Provide a sanitized version of the error message
      }, 
      { status: statusCode }
    );
  }
} 