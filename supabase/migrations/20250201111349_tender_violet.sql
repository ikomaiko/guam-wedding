/*
  # Add is_answered_qa column to guests table

  1. Changes
    - Add is_answered_qa boolean column to guests table with default value false
    - Create index for better query performance

  2. Purpose
    - Track whether guests have completed their initial QA responses
    - Used for redirecting new users to welcome page
*/

-- Add is_answered_qa column to guests table
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS is_answered_qa boolean DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_guests_is_answered_qa
  ON guests(is_answered_qa);