# Supabase Storage Setup Guide

This guide explains how to set up the Supabase storage bucket for the Antiques Appraisal application.

## Authentication Required

The Antiques Appraisal application requires users to be authenticated to upload images. This ensures that:

1. Each user's images are stored in their own folder
2. Users can only access their own images 
3. The API endpoints that process images are properly secured

## Storage Bucket Configuration

1. **Create the Bucket**:
   - Log in to your Supabase dashboard
   - Go to Storage > Buckets
   - Create a new bucket named `antique-images`
   - Enable RLS (Row Level Security)
   - Make the bucket public (for image viewing)

2. **Set Up RLS Policies**:
   - After creating the bucket, click on "Policies" for the `antique-images` bucket
   - Add the following policies:

### Policy 1: Allow authenticated users to upload to their own folder

- Policy name: `Users can upload to their own folder`
- For operation: `INSERT`
- Target roles: `authenticated`
- Using expression:
```sql
(bucket_id = 'antique-images' AND auth.uid()::text = SPLIT_PART(name, '/', 1))
```

### Policy 2: Allow anyone to read all objects (for viewing images)

- Policy name: `Anyone can read all objects`
- For operation: `SELECT`
- Target roles: `public`
- Using expression:
```sql
(bucket_id = 'antique-images')
```

### Policy 3: Allow users to update their own objects

- Policy name: `Users can update their own objects`
- For operation: `UPDATE`
- Target roles: `authenticated`
- Using expression:
```sql
(bucket_id = 'antique-images' AND auth.uid()::text = SPLIT_PART(name, '/', 1))
```

### Policy 4: Allow users to delete their own objects

- Policy name: `Users can delete their own objects`
- For operation: `DELETE`
- Target roles: `authenticated`
- Using expression:
```sql
(bucket_id = 'antique-images' AND auth.uid()::text = SPLIT_PART(name, '/', 1))
```

## Troubleshooting

If you encounter issues with storage, here are common solutions:

### 403 Unauthorized / RLS Violation errors

If you see errors like `new row violates row-level security policy`, this means:
- The RLS policies might not be set up correctly
- The user might not be authenticated
- The user might be trying to upload to a folder they don't own

**Fix**:
1. Check your RLS policies in the Supabase dashboard
2. Make sure the user is authenticated (signed in)
3. Ensure the user is uploading to their own folder (based on user ID)

### Authentication Issues

Make sure your authentication is properly set up:

1. Navigate to Auth > Providers in your Supabase dashboard
2. Ensure Email provider is enabled
3. Configure any other providers you want to use (Google, GitHub, etc.)
4. Make sure your site URL and redirect URLs are correctly configured

## Migrating Policies

If you need to add these policies via a migration script, you can use:

```sql
-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'antique-images' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Create policy for anyone to read all objects
CREATE POLICY "Anyone can read all objects" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'antique-images');

-- Create policy for users to update their own objects
CREATE POLICY "Users can update their own objects" 
ON storage.objects FOR UPDATE
TO authenticated 
USING (
  bucket_id = 'antique-images' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Create policy for users to delete their own objects
CREATE POLICY "Users can delete their own objects" 
ON storage.objects FOR DELETE
TO authenticated 
USING (
  bucket_id = 'antique-images' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);
``` 