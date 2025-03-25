-- Create the antique-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'antique-images',
  'antique-images',
  FALSE, -- Not public, will use RLS for access
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[]
);

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

-- Allow public access to all images (if needed)
-- Uncomment this if you want to let anyone view the images
-- Alternatively, you can create more granular policies
/*
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'antique-images'
);
*/

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