/*
  # Fix timeline_events side data migration

  1. Changes
    - Add side column if it doesn't exist
    - Update side values based on creator's side
    - Make side column required

  2. Data Migration
    - Set side based on creator's side from guests table
    - Use fallback value for any remaining nulls
*/

-- First ensure the side column exists
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

-- Update side values based on creator's side
UPDATE timeline_events te
SET side = (
  SELECT g.side
  FROM guests g
  WHERE g.id = te.created_by
)
WHERE te.side IS NULL
AND te.created_by IS NOT NULL;

-- Set default side for any remaining nulls
UPDATE timeline_events
SET side = '新郎側'
WHERE side IS NULL;

-- Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_timeline_events_side
  ON timeline_events(side);

-- Make side column required
ALTER TABLE timeline_events
  ALTER COLUMN side SET NOT NULL;