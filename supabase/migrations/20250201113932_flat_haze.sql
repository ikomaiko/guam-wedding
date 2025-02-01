/*
  # Fix RLS policies for avatars and profiles

  1. Storage Policies
    - Enable public read access to avatars
    - Allow authenticated users to manage their own avatars
  
  2. Profile Policies
    - Enable public read access to profiles
    - Allow users to manage their own profiles
*/

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create new storage policies
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticatedにほ
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Drop existing profile policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by all authenticated users" ON guest_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON guest_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON guest_profiles;

-- Create new profile policies
CREATE POLICY "Public read access for profiles"
ON guest_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON guest_profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
ON guest_profiles FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete their own profile"
ON guest_profiles FOR DELETE
TO authenticated
USING (true);