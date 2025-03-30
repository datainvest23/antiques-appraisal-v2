import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    // Fix: correctly handle cookies
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }
    
    // Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Optimize image using sharp
    const optimizedImage = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer()
    
    // Create a unique filename with timestamp
    const timestamp = Date.now()
    const fileName = `${timestamp}.jpg`  // Always save as jpg after optimization
    const folderPath = `${userId}`
    
    // Upload optimized image to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('antique-images')
      .upload(`${folderPath}/${fileName}`, optimizedImage, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Error uploading to Supabase Storage:', error)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('antique-images')
      .getPublicUrl(`${folderPath}/${fileName}`)
    
    // Return the upload result with CORS headers
    return NextResponse.json({ 
      url: publicUrl,
      uploadPath: data.path,
      size: optimizedImage.length,
      format: 'jpeg',
      dimensions: {
        width: 1200,
        height: 1200
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    
  } catch (error) {
    console.error('Error in upload-image API route:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Server error'
    }, { status: 500 })
  }
} 