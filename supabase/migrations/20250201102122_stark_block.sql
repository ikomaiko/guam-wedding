/*
  # Create guest profiles and QA tables

  1. New Tables
    - `guest_profiles`
      - `id` (uuid, primary key)
      - `guest_id` (uuid, foreign key to guests)
      - `avatar_url` (text, nullable)
      - `location` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `guest_qa`
      - `id` (uuid, primary key)
      - `guest_id` (uuid, foreign key to guests)
      - `question_key` (text)
      - `answer` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and updating profiles
*/

-- Create guest_profiles table
CREATE TABLE IF NOT EXISTS guest_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  avatar_url text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(guest_id)
);

-- Create guest_qa table
CREATE TABLE IF NOT EXISTS guest_qa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  answer text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(guest_id, question_key)
);

-- Enable RLS
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_qa ENABLE ROW LEVEL SECURITY;

-- Create policies for guest_profiles
CREATE POLICY "Profiles are viewable by all authenticated users"
  ON guest_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON guest_profiles
  FOR UPDATE
  USING (auth.uid() = guest_id);

CREATE POLICY "Users can insert their own profile"
  ON guest_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = guest_id);

-- Create policies for guest_qa
CREATE POLICY "Q&A is viewable by all authenticated users"
  ON guest_qa
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own Q&A"
  ON guest_qa
  FOR UPDATE
  USING (auth.uid() = guest_id);

CREATE POLICY "Users can insert their own Q&A"
  ON guest_qa
  FOR INSERT
  WITH CHECK (auth.uid() = guest_id);

-- Create indexes
CREATE INDEX idx_guest_profiles_guest_id ON guest_profiles(guest_id);
CREATE INDEX idx_guest_qa_guest_id ON guest_qa(guest_id);
CREATE INDEX idx_guest_qa_question_key ON guest_qa(question_key);