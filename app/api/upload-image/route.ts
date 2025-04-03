import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ensureDevUserFolder } from '@/lib/storage-helpers'

// Import sharp dynamically to handle cases where it might not be available
let sharp: any;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp module not available, image optimization disabled');
}

export async function POST(request: NextRequest) {
  try {
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

    // Use createRouteHandlerClient with await on cookies()
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get authenticated user using getUser
    const { data, error: authError } = await supabase.auth.getUser()
    
    if (authError || !data.user) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: 'You must be logged in to upload images. If testing in development, please sign in first.' 
      }, { status: 401 })
    }
    
    // Always use the authenticated user's ID
    const userId = data.user.id
    console.log(`Uploading image for authenticated user: ${userId}`)
    
    // Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Define variables for image data
    let processedImage = buffer;
    let imageFormat = file.type.split('/')[1] || 'jpeg';
    let imageWidth = 0;
    let imageHeight = 0;
    
    // Optimize image using sharp if available
    if (sharp) {
      try {
        processedImage = await sharp(buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality: 85,
            progressive: true
          })
          .toBuffer();
        
        // Get the image metadata
        const metadata = await sharp(processedImage).metadata();
        imageWidth = metadata.width || 0;
        imageHeight = metadata.height || 0;
        imageFormat = 'jpeg';
      } catch (error) {
        console.warn('Image optimization failed, using original image', error);
        // Fallback to original image
        processedImage = buffer;
      }
    }
    
    // Create a unique filename with timestamp
    const timestamp = Date.now()
    const extension = sharp ? 'jpg' : imageFormat;
    const fileName = `${timestamp}.${extension}`
    const folderPath = `${userId}`
    
    try {
      // First, check if the user folder exists by listing it
      const { data: folderExists, error: folderError } = await supabase
        .storage
        .from('antique-images')
        .list(folderPath, { limit: 1 })
      
      // If folder doesn't exist or we got an error, try to create it with an empty file
      if (folderError || !folderExists || folderExists.length === 0) {
        console.log(`Creating folder for user: ${folderPath}`)
        try {
          // Create an empty placeholder file to establish the folder
          const emptyBuffer = new Uint8Array(0);
          await supabase
            .storage
            .from('antique-images')
            .upload(`${folderPath}/.folder`, emptyBuffer, {
              contentType: 'text/plain',
              upsert: true
            });
        } catch (folderCreateError) {
          console.warn('Failed to create user folder:', folderCreateError);
          // Continue anyway, as the folder might be created by another process
        }
      }
      
      // Upload processed image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('antique-images')
        .upload(`${folderPath}/${fileName}`, processedImage, {
          contentType: sharp ? 'image/jpeg' : file.type,
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        console.error('Error uploading to Supabase Storage:', uploadError)
        
        // Provide more helpful error messages based on the error type
        if (uploadError.message?.includes('row-level security') || 
            uploadError.message?.includes('403')) {
          return NextResponse.json({ 
            error: 'Permission denied', 
            details: 'The storage bucket may not be configured correctly for uploads. See docs/supabase-storage-setup.md for configuration instructions.' 
          }, { status: 403 })
        }
        
        return NextResponse.json({ 
          error: 'Failed to upload image', 
          details: uploadError.message 
        }, { status: 500 })
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('antique-images')
        .getPublicUrl(`${folderPath}/${fileName}`)
      
      // Return the upload result with CORS headers
      return NextResponse.json({ 
        url: publicUrl,
        uploadPath: uploadData.path,
        size: processedImage.length,
        format: imageFormat,
        dimensions: {
          width: imageWidth || 'unknown',
          height: imageHeight || 'unknown'
        }
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })
    } catch (storageError) {
      console.error('Detailed storage error:', storageError)
      return NextResponse.json({ 
        error: 'Storage operation failed', 
        details: storageError instanceof Error ? storageError.message : 'Unknown error'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error in upload-image API route:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Server error'
    }, { status: 500 })
  }
} 