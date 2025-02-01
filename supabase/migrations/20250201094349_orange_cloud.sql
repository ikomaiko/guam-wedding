/*
  # Add timeline features

  1. Changes
    - Add created_by column to timeline_events table
    - Add family column to timeline_events table
    - Update RLS policies for timeline_events

  2. Security
    - Enable RLS on timeline_events table
    - Add policies for public, family, and private visibility
    - Only allow users to delete their own events
    - Prevent deletion of master data (created_by is null)
*/

-- Add created_by and family columns
ALTER TABLE timeline_events
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES guests(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS family text CHECK (family IN ('ikoma', 'onohara'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_timeline_events_created_by
  ON timeline_events(created_by);

CREATE INDEX IF NOT EXISTS idx_timeline_events_family
  ON timeline_events(family);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view public timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can view family timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can view private timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can insert their own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can update their own timeline events" ON timeline_events;

-- Create new policies
CREATE POLICY "Users can view public timeline events"
  ON timeline_events
  FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view family timeline events"
  ON timeline_events
  FOR SELECT
  USING (
    visibility = 'family'
    AND EXISTS (
      SELECT 1 FROM guests g1, guests g2
      WHERE g1.id = auth.uid()
      AND g2.id = timeline_events.created_by
      AND g1.side = g2.side
    )
  );

CREATE POLICY "Users can view private timeline events"
  ON timeline_events
  FOR SELECT
  USING (
    visibility = 'private'
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can insert their own timeline events"
  ON timeline_events
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own timeline events"
  ON timeline_events
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own timeline events"
  ON timeline_events
  FOR DELETE
  USING (created_by = auth.uid());