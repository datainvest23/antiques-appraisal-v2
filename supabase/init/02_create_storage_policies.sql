-- Check if the bucket exists, create it only if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'antique-images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'antique-images',
            'antique-images',
            FALSE, -- Not public, will use RLS for access
            10485760, -- 10MB file size limit
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[]
        );
        RAISE NOTICE 'Created antique-images bucket';
    ELSE
        RAISE NOTICE 'Bucket antique-images already exists, skipping creation';
    END IF;
END
$$;

-- First drop any existing policies to avoid duplicate policy errors
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'antique-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own images
CREATE POLICY "Users can view their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'antique-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add a policy for public access to files through the public URL
CREATE POLICY "Public access to images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'antique-images'
);

-- Allow users to update their own images
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'antique-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'antique-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Set bucket to public if it's already private
UPDATE storage.buckets
SET public = TRUE
WHERE id = 'antique-images' AND public = FALSE; 