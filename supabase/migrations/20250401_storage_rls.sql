-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'antique-images' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Create a policy that allows anyone to read all objects
CREATE POLICY "Anyone can read all objects" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'antique-images');

-- Create a policy that allows users to update their own objects
CREATE POLICY "Users can update their own objects" 
ON storage.objects FOR UPDATE
TO authenticated 
USING (
  bucket_id = 'antique-images' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Create a policy that allows users to delete their own objects
CREATE POLICY "Users can delete their own objects" 
ON storage.objects FOR DELETE
TO authenticated 
USING (
  bucket_id = 'antique-images' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Ensure the dev-user folder exists for anonymous users in development
-- Note: The following is a comment as this action would need to be performed via code or manually
-- INSERT INTO storage.objects (bucket_id, name, path) 
-- VALUES ('antique-images', 'dev-user', 'dev-user/')
-- ON CONFLICT DO NOTHING; 