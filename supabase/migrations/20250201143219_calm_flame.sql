/*
  # Add creator and sharing information to guest Q&A

  1. Changes
    - Add created_by column to track who created the question
    - Add is_shared column to indicate if the question is shared with others
    - Add indexes for better query performance

  2. Notes
    - created_by stores the name of the user who created the question
    - is_shared indicates whether the question should appear on other users' profiles
*/

-- Add new columns to guest_qa table
ALTER TABLE guest_qa
  ADD COLUMN created_by text,
  ADD COLUMN is_shared boolean DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guest_qa_created_by ON guest_qa(created_by);
CREATE INDEX IF NOT EXISTS idx_guest_qa_is_shared ON guest_qa(is_shared);