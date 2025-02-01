/*
  # Fix timeline_events side column data

  1. Changes
    - Update null side values based on creator's side
    - Ensure all rows have a valid side value

  2. Data Migration
    - Set side based on created_by user's side from guests table
*/

-- Update null side values based on creator's side
UPDATE timeline_events te
SET side = g.side
FROM guests g
WHERE te.created_by = g.id
AND te.side IS NULL;

-- Set a default side for any remaining null values (fallback to '新郎側')
UPDATE timeline_events
SET side = '新郎側'
WHERE side IS NULL;