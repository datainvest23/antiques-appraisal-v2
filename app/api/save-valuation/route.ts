import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { AntiqueAnalysisResult } from '@/lib/openai';

export const POST = async (request: NextRequest) => {
  try {
    // Get the authenticated user from Supabase Auth
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to save valuations' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { analysisData, isDetailed = false } = await request.json();
    
    if (!analysisData) {
      return NextResponse.json(
        { error: 'No analysis data provided' },
        { status: 400 }
      );
    }
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('valuations')
      .insert([
        {
          user_id: userId,
          is_detailed: isDetailed,
          valuation_report: analysisData,
        }
      ])
      .select('valuation_id')
      .single();
      
    if (error) {
      console.error('Error saving valuation:', error);
      return NextResponse.json(
        { error: 'Failed to save valuation' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      valuationId: data.valuation_id 
    });
    
  } catch (error) {
    console.error('Error in save-valuation route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}; 