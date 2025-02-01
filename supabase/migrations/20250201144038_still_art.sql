/*
  # Update schema to match current structure

  1. Changes
    - Add subject column to questions table
    - Add created_by column to questions table
    - Update guest_qa table structure
    - Add indexes for better performance

  2. Notes
    - subject can be either 'public' or 'private'
    - created_by references the guest who created the question
*/

-- Add new columns to questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS subject text CHECK (subject IN ('public', 'private')),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES guests(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);

-- Update guest_qa table
ALTER TABLE guest_qa
  ADD COLUMN IF NOT EXISTS created_by text,
  ADD COLUMN IF NOT EXISTS is_shared boolean DEFAULT false;

-- Create indexes for guest_qa
CREATE INDEX IF NOT EXISTS idx_guest_qa_created_by ON guest_qa(created_by);
CREATE INDEX IF NOT EXISTS idx_guest_qa_is_shared ON guest_qa(is_shared);

-- Update existing data
UPDATE questions
SET subject = 'public'
WHERE subject IS NULL;

UPDATE guest_qa
SET is_shared = false
WHERE is_shared IS NULL;