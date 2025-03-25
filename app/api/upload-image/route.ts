import { NextResponse, type NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the user ID from the session
    const userId = session.user.id
    
    // Get the form data with file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate the file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }
    
    // Validate the file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    // Upload the file to Supabase storage
    const { error } = await supabase.storage
      .from('antique-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('antique-images')
      .getPublicUrl(fileName)
    
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Error in upload-image API route:', error)
    return NextResponse.json({ error: 'Failed to process image upload' }, { status: 500 })
  }
} 