import { NextRequest, NextResponse } from 'next/server';
import { analyzeAntique } from '@/lib/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // RECOMMENDATION: Implement input validation for the request body (e.g., using Zod or a similar library)
  // to ensure 'imageUrls', 'additionalInfo', etc., are present and correctly typed.
  try {
    // Log when the request is received, including a non-sensitive identifier if available (e.g., part of the URL or a generated ID)
    console.log(`Received request for antique analysis: ${request.url}`);

    // Create a Supabase client configured for route handlers
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const { imageUrls, additionalInfo } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Analyze the antique
    const analysis = await analyzeAntique(imageUrls, additionalInfo);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in analyze-antique route:', error); // Keep detailed server-side log

    let errorMessage = 'Failed to analyze antique.';
    let errorDetails = 'An unexpected error occurred.';
    let statusCode = 500;

    if (error instanceof Error) {
      // Customize messages based on error types if needed
      if (error.message.includes('No valid JSON found') || error.message.includes('Failed to parse')) {
        errorMessage = 'Error processing analysis data.';
        errorDetails = 'Could not interpret the response from the analysis service.';
        statusCode = 502; // Bad Gateway, as we failed to process a response from an upstream service
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication failed.';
        errorDetails = 'Please ensure you are properly authenticated.';
        statusCode = 401;
      } else if (error.message.includes('No images provided')) {
        errorMessage = 'Invalid input.';
        errorDetails = 'No images were provided for analysis.';
        statusCode = 400;
      }
      // For other generic errors, use the default messages but log the specific one.
      if (statusCode === 500) { // If not one of the specific cases above
         errorDetails = error.message; // For a generic server error, providing the original message might be okay if it's not too technical
      }
    }
    
    // Return a standardized JSON error response
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails
      }, 
      { status: statusCode }
    );
  }
}

