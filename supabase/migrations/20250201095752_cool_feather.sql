/*
  # Update timeline_events to use side instead of family

  1. Changes
    - Add side column to timeline_events
    - Migrate existing data from family to side
    - Update constraints and indexes

  2. Data Migration
    - 'ikoma' becomes '新郎側'
    - 'onohara' becomes '新婦側'

  3. Security
    - Update RLS policies to use side instead of family
*/

-- Add side column
ALTER TABLE timeline_events
  ADD COLUMN side text CHECK (side IN ('新郎側', '新婦側'));

-- Migrate existing data
UPDATE timeline_events
SET side = CASE
  WHEN family = 'ikoma' THEN '新郎側'
  WHEN family = 'onohara' THEN '新婦側'
  ELSE NULL
END;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_timeline_events_side
  ON timeline_events(side);

-- Make side column required after data migration
ALTER TABLE timeline_events
  ALTER COLUMN side SET NOT NULL;

-- Drop old family column and index
DROP INDEX IF EXISTS idx_timeline_events_family;
ALTER TABLE timeline_events
  DROP COLUMN family;