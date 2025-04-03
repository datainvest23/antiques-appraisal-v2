import { supabase } from './supabase-client';

/**
 * Ensure a user's folder exists in the antique-images bucket
 */
export async function ensureUserFolder(userId: string) {
  if (!userId) {
    throw new Error('User ID is required to create folder');
  }

  try {
    // Check if the folder exists by listing objects with the prefix
    const { data: existingObjects, error: listError } = await supabase
      .storage
      .from('antique-images')
      .list(userId, {
        limit: 1,
      });

    // If we get an error or no objects, create the folder
    if (listError || (existingObjects && existingObjects.length === 0)) {
      console.log(`Creating folder for user: ${userId}`);
      
      // Create an empty file to establish the folder
      // Using a zero-byte text file as a placeholder
      const emptyBuffer = new Uint8Array(0);
      
      await supabase
        .storage
        .from('antique-images')
        .upload(`${userId}/.folder`, emptyBuffer, {
          contentType: 'text/plain',
          upsert: true
        });
    }
  } catch (error) {
    console.warn(`Failed to ensure folder exists for user ${userId}:`, error);
    // Continue anyway, as the folder might be created by another process
  }
}

/**
 * Upload an image to Supabase storage with proper error handling
 */
export async function uploadImageToStorage(file: File, userId: string): Promise<string> {
  if (!userId) {
    throw new Error('User ID is required to upload image');
  }

  try {
    // Ensure the user folder exists
    await ensureUserFolder(userId);

    // Create a unique file name with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('antique-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      
      // If the error is related to permissions, try to provide a more helpful message
      if (uploadError.message?.includes('row-level security') || 
          uploadError.message?.includes('403')) {
        throw new Error('Permission denied. The storage bucket may not be configured correctly.');
      }
      
      throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('antique-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToStorage:', error);
    throw error;
  }
} 