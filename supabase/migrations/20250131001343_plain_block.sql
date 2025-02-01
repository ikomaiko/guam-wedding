/*
  # Create Timeline and Checklist tables

  1. New Tables
    - `timeline_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (timestamp)
      - `title` (text)
      - `description` (text)
      - `visibility` (enum: 'public', 'family', 'private')
      - `created_at` (timestamp)

    - `checklist_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `is_completed` (boolean)
      - `due_type` (enum: 'two_weeks', 'day_before', 'custom')
      - `visibility` (enum: 'public', 'family', 'private')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create enum types
CREATE TYPE visibility_type AS ENUM ('public', 'family', 'private');
CREATE TYPE due_type AS ENUM ('two_weeks', 'day_before', 'custom');

-- Create timeline_events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  title text NOT NULL,
  description text,
  visibility visibility_type NOT NULL DEFAULT 'public',
  created_at timestamptz DEFAULT now()
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  due_type due_type NOT NULL,
  visibility visibility_type NOT NULL DEFAULT 'public',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Timeline policies
CREATE POLICY "Users can view public timeline events"
  ON timeline_events
  FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view family timeline events"
  ON timeline_events
  FOR SELECT
  USING (visibility = 'family');

CREATE POLICY "Users can view their own private timeline events"
  ON timeline_events
  FOR SELECT
  USING (auth.uid() = user_id AND visibility = 'private');

CREATE POLICY "Users can insert their own timeline events"
  ON timeline_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeline events"
  ON timeline_events
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Checklist policies
CREATE POLICY "Users can view public checklist items"
  ON checklist_items
  FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view family checklist items"
  ON checklist_items
  FOR SELECT
  USING (visibility = 'family');

CREATE POLICY "Users can view their own private checklist items"
  ON checklist_items
  FOR SELECT
  USING (auth.uid() = user_id AND visibility = 'private');

CREATE POLICY "Users can insert their own checklist items"
  ON checklist_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items"
  ON checklist_items
  FOR UPDATE
  USING (auth.uid() = user_id);