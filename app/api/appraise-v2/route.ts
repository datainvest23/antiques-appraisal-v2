import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { processMarkdownResponse, extractSection } from '@/lib/markdown';

// Initialize Supabase Admin to bypass RLS/privacy for image fetching
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper function to fetch an image (handling both external and Supabase URLs)
async function fetchImageAsBase64(url: string): Promise<{ data: string, mimeType: string }> {
  try {
    console.log('--- FETCHING IMAGE FOR AI GATEWAY ---');
    console.log('URL:', url);

    if (!url || typeof url !== 'string') {
      throw new Error(`Invalid image URL: ${url}`);
    }

    let buffer: Buffer;
    let contentType: string;

    // Handle Supabase Storage URLs specifically to use Admin client
    if (url.includes('.supabase.co/storage/v1/object/')) {
      console.log('Detected Supabase URL, using admin client to download...');

      // Extract bucket and path
      // Format: .../object/public/[bucket]/[path]
      const urlParts = url.split('/object/public/');
      if (urlParts.length < 2) {
        throw new Error(`Malformed Supabase URL: ${url}`);
      }

      const pathParts = urlParts[1].split('/');
      const bucket = pathParts[0];
      const path = pathParts.slice(1).join('/');

      console.log(`Downloading from Bucket: ${bucket}, Path: ${path}`);

      // Download directly using service role key
      const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);

      if (error || !data) {
        console.error('Supabase download error:', error);
        throw new Error(`Failed to download from Supabase: ${error?.message || 'Empty response'}`);
      }

      const arrayBuffer = await data.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = data.type || 'image/jpeg';
    } else {
      // Standard fetch for external URLs
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'image/*' },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No body');
        console.error(`Fetch failed with status ${response.status}: ${response.statusText}`);
        throw new Error(`Failed to fetch image: ${response.statusText} (${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = response.headers.get('content-type') || 'image/jpeg';
    }

    console.log(`Success! Fetched ${buffer.length} bytes, type: ${contentType}`);

    return {
      data: buffer.toString('base64'),
      mimeType: contentType
    };
  } catch (error) {
    console.error('CRITICAL: Error in fetchImageAsBase64:', error);
    throw error;
  }
}

// Helper to extract a value from markdown based on a label
function extractField(content: string, label: string): string | null {
  // Support various formats: "**Label**: Value", "* **Label**: Value", "- Label: Value", etc.
  const regex = new RegExp(`(?:^|\\n)[\\-\\s*\\d\\.]*[\\*_]*${label}[\\*_]*[:\\s]*([^\\r\\n]+)`, 'i');
  const match = content.match(regex);
  const value = match ? match[1].trim() : null;
  // Clean up bracketed placeholders
  return value && !value.startsWith('[') ? value.replace(/^[:\s\-]+/, '') : null;
}

// Helper to extract a value specifically from the Fact Sheet table
function extractFromTable(content: string, feature: string): string | null {
  const lines = content.split('\n');
  // Match lines like "| **Material** | Value |" or "| Material | Value |"
  const featureRegex = new RegExp(`^[\\s|]*[\\*_]*${feature}[\\*_]*[\\s|]*`, 'i');
  const tableLine = lines.find(line => featureRegex.test(line) && line.includes('|'));

  if (tableLine) {
    const parts = tableLine.split('|').filter(p => p.trim());
    if (parts.length >= 2) {
      // If it starts with the feature, the value is in the next part
      const value = parts[1].trim();
      return value && !value.startsWith('[') ? value : null;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = userData.user.id;
    const body = await request.json();
    const { imageUrls, additionalInfo } = body;

    if (!imageUrls || !imageUrls.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // 1. Load custom instructions from PROMPTS/initial-categorization-v1.md (concise, basic)
    const promptPath = path.join(process.cwd(), 'docs/PROMPTS/initial-categorization-v1.md');
    const systemPrompt = fs.readFileSync(promptPath, 'utf8');

    // 2. Prepare images for AI Gateway
    const images = await Promise.all(imageUrls.map((url: string) => fetchImageAsBase64(url)));

    // 3. Call Kimi-K2.5 via Vercel AI Gateway
    const modelId = 'moonshotai/kimi-k2.5';
    console.log(`--- CALLING AI GATEWAY MODEL: ${modelId} ---`);

    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: `USER PROVIDED FACTS: ${additionalInfo || 'None'}` },
              ...images.map(img => ({
                type: 'image_url',
                image_url: { url: `data:${img.mimeType};base64,${img.data}` }
              }))
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error for ${modelId}:`, errorText);
      throw new Error(`AI Gateway failed: ${response.statusText}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    const formattedContent = processMarkdownResponse(content);

    // 4. Extract facts for structured table storage
    const extractedData = {
      user_id: userId,
      object_name: extractField(content, 'Object Name'),
      category: extractField(content, 'Category'),
      stylistic_period: extractField(content, 'Estimated Era'),
      materials: extractFromTable(content, 'Material'),
      inscriptions_marks: extractFromTable(content, 'Markings'),
      condition: extractFromTable(content, 'Condition'),
      primary_colors: extractFromTable(content, 'Primary Colors'),
      intake_comments: additionalInfo,
      image_urls: imageUrls,
      kimi_analysis: aiData,
      // Default confidence level for initial appraisal
      confidence_level: 'Initial Assessment'
    };

    // 5. Save to the new kimi_appraisals table
    console.log('Saving to kimi_appraisals table...');
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('kimi_appraisals')
      .insert(extractedData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error saving Kimi appraisal:', dbError);
    }

    // Prepare UI data
    // Prepare UI data - handle both "Historical Context" and "Description"
    const historicalContextRaw = extractSection(content, 'Historical Context') || extractSection(content, 'Description');
    const historicalContext = historicalContextRaw ? processMarkdownResponse(historicalContextRaw) : null;

    return NextResponse.json({
      dual_mode: false,
      model: modelId,
      content: formattedContent,
      raw_content: content,
      db_id: dbData?.id,
      extracted_data: {
        ...extractedData,
        historical_context: historicalContext
      }
    });

  } catch (error: any) {
    console.error('Error in appraise-v2 (POST):', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}