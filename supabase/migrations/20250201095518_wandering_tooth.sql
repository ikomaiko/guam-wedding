/*
  # Add family column to timeline_events table

  1. Changes
    - Add family column to timeline_events table
    - Add check constraint to ensure valid values
    - Add index for performance

  2. Notes
    - Family can be either 'ikoma' or 'onohara'
    - Index added to improve query performance
*/

-- Add family column with check constraint
ALTER TABLE timeline_events
  ADD COLUMN IF NOT EXISTS family text CHECK (family IN ('ikoma', 'onohara'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_timeline_events_family
  ON timeline_events(family);