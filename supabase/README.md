# Supabase Setup for Antiques Appraisal

This directory contains SQL scripts to set up the necessary Supabase resources for the Antiques Appraisal application.

## Available Scripts

1. `init/02_create_storage.sql` - Creates the storage bucket and RLS policies for image uploads

## How to Apply These Scripts

### Method 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the SQL file you want to run
5. Execute the query

### Method 2: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db diff --file <filename>.sql
```

## Storage Bucket Configuration

The included SQL creates:

- A storage bucket named `antique-images` for storing user-uploaded images
- RLS policies that:
  - Allow users to upload images to their own user ID folder
  - Allow users to view only their own images
  - Allow users to update and delete only their own images

## Troubleshooting

If you encounter a "row-level security policy violation" error when uploading:

1. Make sure you've run the SQL to create the storage bucket
2. Verify that the user is authenticated
3. Ensure the file path in your upload uses the user's ID as the folder name (e.g., `userId/filename.jpg`)

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security (RLS) Policies](https://supabase.com/docs/guides/auth/row-level-security) 