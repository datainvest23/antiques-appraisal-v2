import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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
    
    // Limit file size (3MB)
    const maxSize = 3 * 1024 * 1024 // 3MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size exceeds 3MB limit. Please use smaller images.' 
      }, { status: 400 })
    }
    
    // Create a unique filename with timestamp
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}.${fileExtension}`
    const folderPath = `${userId}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('antique-images')
      .upload(`${folderPath}/${fileName}`, file, {
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
      uploadPath: data.path
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    
  } catch (error) {
    console.error('Error in upload-image API route:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 