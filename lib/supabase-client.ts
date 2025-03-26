import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// Create a Supabase client for use in client components
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Upload a file to Supabase storage
export async function uploadImage(file: File, userId: string): Promise<string> {
  try {
    const supabase = createClient()
    
    // Create a unique file name based on user ID and timestamp
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    // Upload the file to the 'antique-images' bucket
    const { error } = await supabase.storage
      .from('antique-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw error
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('antique-images')
      .getPublicUrl(fileName)
    
    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}

// Create a placeholder for Database type until we create that file
export type { Database } 