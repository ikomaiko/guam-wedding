/*
  # Fix timeline policies

  1. Changes
    - Drop duplicate policies
    - Re-create necessary policies with proper visibility rules

  2. Security
    - Ensure proper access control based on visibility:
      - Public events visible to all
      - Family events visible to same side
      - Private events visible to creator only
*/

-- Drop all existing timeline policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view public timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can view family timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can view private timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can insert their own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can update their own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can delete their own timeline events" ON timeline_events;

-- Re-create policies with proper visibility rules
CREATE POLICY "Timeline public events are visible to all"
  ON timeline_events
  FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Timeline family events are visible to same side"
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

CREATE POLICY "Timeline private events are visible to creator"
  ON timeline_events
  FOR SELECT
  USING (
    visibility = 'private'
    AND created_by = auth.uid()
  );

CREATE POLICY "Timeline events can be created by authenticated users"
  ON timeline_events
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Timeline events can be updated by creator"
  ON timeline_events
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Timeline events can be deleted by creator"
  ON timeline_events
  FOR DELETE
  USING (created_by = auth.uid());