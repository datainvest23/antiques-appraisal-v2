import { NextRequest, NextResponse } from 'next/server';
import { analyzeAntique } from '@/lib/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
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
    console.error('Error in analyze-antique route:', error);
    return NextResponse.json({ error: 'Failed to analyze antique' }, { status: 500 });
  }
}

