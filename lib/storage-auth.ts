import { createClient } from './supabase-client'

/**
 * Converts a Supabase storage path or public URL to a signed URL
 * if the path belongs to the 'antique-images' bucket.
 */
export async function getSignedImageUrl(pathOrUrl: string, expiresIn = 3600): Promise<string> {
    if (!pathOrUrl || !pathOrUrl.includes('antique-images')) {
        return pathOrUrl
    }

    try {
        const supabase = createClient()

        // Extract the path after 'antique-images/'
        // Example URL: https://.../storage/v1/object/public/antique-images/user-id/image.jpg
        let path = pathOrUrl
        if (pathOrUrl.startsWith('http')) {
            const parts = pathOrUrl.split('antique-images/')
            if (parts.length > 1) {
                path = parts[1]
            }
        }

        const { data, error } = await supabase.storage
            .from('antique-images')
            .createSignedUrl(path, expiresIn)

        if (error) {
            console.error('Error creating signed URL:', error)
            return pathOrUrl // Fallback to original
        }

        return data.signedUrl
    } catch (error) {
        console.error('Exception in getSignedImageUrl:', error)
        return pathOrUrl
    }
}
