/*
  # Open storage and profile policies

  1. Changes
    - Remove restrictive RLS policies
    - Allow public access to avatars bucket
    - Allow all operations on guest_profiles table

  2. Security Note
    - This is a more permissive setup for development
    - Consider adding proper RLS policies for production
*/

-- Storage policies
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- Ensure avatars bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create open storage policies
CREATE POLICY "Open access for avatars"
ON storage.objects FOR ALL
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Profile policies
DROP POLICY IF EXISTS "Public read access for profiles" ON guest_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON guest_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON guest_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON guest_profiles;

-- Disable RLS on guest_profiles
ALTER TABLE guest_profiles DISABLE ROW LEVEL SECURITY;

-- Create open policy for guest_profiles
CREATE POLICY "Open access for profiles"
ON guest_profiles FOR ALL
USING (true)
WITH CHECK (true);