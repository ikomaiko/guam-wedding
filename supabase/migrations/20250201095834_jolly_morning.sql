/*
  # Update timeline_events side column

  1. Changes
    - Ensure side column exists with proper constraints
    - Update RLS policies to use side

  2. Security
    - Update RLS policies to use side for visibility rules
*/

-- Ensure side column exists with proper constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'timeline_events' AND column_name = 'side'
  ) THEN
    ALTER TABLE timeline_events
      ADD COLUMN side text CHECK (side IN ('新郎側', '新婦側'));
  END IF;
END $$;

-- Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_timeline_events_side
  ON timeline_events(side);

-- Make side column required if it isn't already
ALTER TABLE timeline_events
  ALTER COLUMN side SET NOT NULL;

-- Update RLS policies to use side
DROP POLICY IF EXISTS "Timeline family events are visible to same side" ON timeline_events;

CREATE POLICY "Timeline family events are visible to same side"
  ON timeline_events
  FOR SELECT
  USING (
    visibility = 'family'
    AND EXISTS (
      SELECT 1 FROM guests g
      WHERE g.id = auth.uid()
      AND g.side = timeline_events.side
    )
  );