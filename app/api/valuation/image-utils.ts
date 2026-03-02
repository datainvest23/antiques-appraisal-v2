/**
 * Fetches an image from a URL and converts it to a base64 string.
 * This is used to pass image data directly to AI models like Perplexity Sonar
 * that might not be able to fetch authenticated URLs directly.
 */
export async function imageUrlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.error("Error in imageUrlToBase64:", error);
        throw error;
    }
}
