/*
  # Fix guest_qa RLS policies

  1. Changes
    - Drop existing RLS policies for guest_qa table
    - Create new policies that allow users to:
      - View all Q&A entries (public read)
      - Create and update their own Q&A entries
      - Delete their own Q&A entries
  
  2. Security
    - Enable RLS on guest_qa table
    - Add policies for CRUD operations
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Q&A is viewable by all authenticated users" ON guest_qa;
DROP POLICY IF EXISTS "Users can update their own Q&A" ON guest_qa;
DROP POLICY IF EXISTS "Users can insert their own Q&A" ON guest_qa;

-- Create new policies
CREATE POLICY "Anyone can view Q&A"
  ON guest_qa
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own Q&A"
  ON guest_qa
  FOR INSERT
  WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Users can update their own Q&A"
  ON guest_qa
  FOR UPDATE
  USING (guest_id = auth.uid());

CREATE POLICY "Users can delete their own Q&A"
  ON guest_qa
  FOR DELETE
  USING (guest_id = auth.uid());