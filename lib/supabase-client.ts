import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'
import type { AntiqueAnalysisResult } from '@/lib/openai'

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

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Save a valuation to Supabase
 */
export async function saveValuation(
  userId: string, 
  analysisData: AntiqueAnalysisResult, 
  isDetailed: boolean = false
) {
  try {
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
      .single()

    if (error) {
      console.error('Error saving valuation:', error)
      return null
    }

    return data.valuation_id
  } catch (error) {
    console.error('Exception saving valuation:', error)
    return null
  }
}

/**
 * Get all valuations for a user
 */
export async function getUserValuations(userId: string) {
  try {
    const { data, error } = await supabase
      .from('valuations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user valuations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching user valuations:', error)
    return []
  }
}

/**
 * Get a specific valuation by ID
 */
export async function getValuationById(valuationId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('valuations')
      .select('*')
      .eq('valuation_id', valuationId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching valuation:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Exception fetching valuation:', error)
    return null
  }
}

// Export the supabase client for direct use
export { supabase } 