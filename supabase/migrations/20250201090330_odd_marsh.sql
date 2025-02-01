/*
  # Add created_by column to checklist_items table

  1. Changes
    - Add created_by column to checklist_items table
    - Add foreign key constraint to guests table
    - Add index for performance
    - Update RLS policies to handle visibility based on created_by

  2. Security
    - Add RLS policies for private items
    - Modify existing policies to handle visibility correctly
*/

-- Add created_by column
ALTER TABLE checklist_items
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES guests(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_checklist_items_created_by
  ON checklist_items(created_by);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view public checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can view family checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can view private checklist items" ON checklist_items;

-- Create new policies
CREATE POLICY "Users can view public checklist items"
  ON checklist_items
  FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view family checklist items"
  ON checklist_items
  FOR SELECT
  USING (
    visibility = 'family'
    AND EXISTS (
      SELECT 1 FROM guests g1, guests g2
      WHERE g1.id = auth.uid()
      AND g2.id = checklist_items.created_by
      AND g1.side = g2.side
    )
  );

CREATE POLICY "Users can view private checklist items"
  ON checklist_items
  FOR SELECT
  USING (
    visibility = 'private'
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can insert their own checklist items"
  ON checklist_items
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own checklist items"
  ON checklist_items
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own checklist items"
  ON checklist_items
  FOR DELETE
  USING (created_by = auth.uid());