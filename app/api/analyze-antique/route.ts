import { NextRequest, NextResponse } from 'next/server';
import { analyzeAntique } from '@/lib/openai';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Fix: correctly handle cookies
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrls, additionalInfo } = await request.json();

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Limit to max 2 images to reduce timeout risk
    const limitedUrls = imageUrls.slice(0, 2);
    console.log('Analyzing antique with limited images:', limitedUrls);

    try {
      const analysisResult = await analyzeAntique(limitedUrls, additionalInfo);

      // Ensure the result contains all expected fields
      if (!analysisResult.physicalAttributes) {
        analysisResult.physicalAttributes = {
          materials: "Not available",
          measurements: "Not available",
          condition: "Not available"
        };
      }

      // Save the valuation to Supabase
      const { data: valuationData, error: valuationError } = await supabase
        .from('valuations')
        .insert([
          {
            user_id: userId,
            is_detailed: false, // This is a standard analysis
            valuation_report: analysisResult,
          }
        ])
        .select('valuation_id')
        .single();
        
      if (valuationError) {
        console.error('Error saving valuation:', valuationError);
        // Continue with the analysis even if saving failed
      }

      // Return standardized response
      return NextResponse.json({ 
        analysis: analysisResult,
        valuationId: valuationData?.valuation_id
      });
    } catch (error) {
      console.error('Error in analysis:', error);
      return NextResponse.json({ 
        error: 'Image analysis failed. Please try with fewer or smaller images.' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in analyze-antique route:', error);
    return NextResponse.json({ 
      error: 'Failed to process your request. Please try again.' 
    }, { status: 500 });
  }
}

