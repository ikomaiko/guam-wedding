/*
  # Fix timeline policies to use side instead of family

  1. Changes
    - Update timeline_events table to use side instead of family
    - Drop family column as it's not needed
    - Update policies to use side for visibility rules

  2. Security
    - Ensure proper access control based on visibility and side:
      - Public events visible to all
      - Family events visible to same side
      - Private events visible to creator only
*/

-- Drop family column as we use side from guests table
ALTER TABLE timeline_events
  DROP COLUMN IF EXISTS family;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_timeline_events_family;

-- Drop all existing timeline policies
DROP POLICY IF EXISTS "Timeline public events are visible to all" ON timeline_events;
DROP POLICY IF EXISTS "Timeline family events are visible to same side" ON timeline_events;
DROP POLICY IF EXISTS "Timeline private events are visible to creator" ON timeline_events;
DROP POLICY IF EXISTS "Timeline events can be created by authenticated users" ON timeline_events;
DROP POLICY IF EXISTS "Timeline events can be updated by creator" ON timeline_events;
DROP POLICY IF EXISTS "Timeline events can be deleted by creator" ON timeline_events;

-- Re-create policies using side
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